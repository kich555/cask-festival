// 로컬 exhibitor-certificates/<업체명>_<아이디>/ 의 참가확인서를 Supabase 비공개 버킷으로 올린다.
// 폴더는 git 에 넣지 않는다(.gitignore). 같은 이름 파일은 덮어쓴다. 평소엔 관리자 페이지에서 올리면 된다.
// 사용법: node --env-file=.env.local scripts/upload-certificates.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.join(fileURLToPath(new URL("..", import.meta.url)), "exhibitor-certificates")
const BUCKET = "exhibitor-certificates"
const TYPES = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// 비공개 버킷 (public: false — 서명 링크로만 받을 수 있다)
const { data: bucket } = await supabase.storage.getBucket(BUCKET)
if (!bucket) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 4 * 1024 * 1024,
  })
  if (error) throw error
  console.log(`버킷 생성: ${BUCKET} (비공개)`)
} else if (bucket.public) {
  throw new Error(`${BUCKET} 버킷이 공개 상태입니다. 비공개로 바꾼 뒤 다시 실행하세요.`)
}

const { data: accounts, error } = await supabase.from("exhibitor_accounts").select("login_id")
if (error) throw error
const ids = new Set(accounts.map((a) => a.login_id))

let ok = 0
for (const dir of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const folder = dir.name.normalize("NFC")
  const loginId = folder.slice(folder.lastIndexOf("_") + 1)
  if (!ids.has(loginId)) {
    console.warn(`건너뜀 (계정 없음): ${folder}`)
    continue
  }
  for (const f of fs.readdirSync(path.join(ROOT, dir.name), { withFileTypes: true })) {
    if (!f.isFile() || f.name.startsWith(".")) continue
    const name = f.name.normalize("NFC")
    const key = `${loginId}/${Buffer.from(name).toString("base64url")}`
    const body = fs.readFileSync(path.join(ROOT, dir.name, f.name))
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, body, {
      upsert: true,
      contentType: TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream",
    })
    if (upErr) console.error(`실패: ${folder}/${name} — ${upErr.message}`)
    else ok++
  }
}
console.log(`업로드 완료: ${ok}개`)
