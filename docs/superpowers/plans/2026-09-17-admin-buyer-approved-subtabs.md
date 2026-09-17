# 승인 탭 메일 발송 세부 탭 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/buyers` 승인 탭 안에 `메일 미발송 / 메일 발송 완료` 세부 탭을 추가한다.

**Architecture:** `AdminDashboard.tsx`에 `mailFilter` state를 추가하고 `visible` 계산에 반영한다. 기존 `approval_email_sent_at` 필드를 그대로 사용하므로 서버 변경 없음.

**Tech Stack:** Next.js, React, TypeScript, Tailwind, Biome, pnpm. (테스트 러너 없음 → 타입체크·린트·수동 확인)

Spec: `docs/superpowers/specs/2026-09-17-admin-buyer-approved-subtabs-design.md`

---

### Task 1: 세부 탭 state와 필터링

**Files:**
- Modify: `src/app/admin/buyers/AdminDashboard.tsx:77-88`

- [ ] **Step 1: state와 카운트 추가** — 77행 `filter` state 아래에:

```tsx
  // 승인 탭 안에서 메일 발송 여부로 한 번 더 나눈다. 남은 발송 작업이 먼저 보이도록 미발송이 기본.
  const [mailFilter, setMailFilter] = useState<"unsent" | "sent">("unsent")
```

`counts` 계산을 다음으로 교체:

```tsx
  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, approved: 0, rejected: 0, unsent: 0, sent: 0 }
    for (const r of rows) {
      c[r.status] += 1
      if (r.status === "approved") c[r.approval_email_sent_at ? "sent" : "unsent"] += 1
    }
    return c
  }, [rows])
```

- [ ] **Step 2: visible 계산 교체**

```tsx
  const visible = rows.filter((r) => {
    if (filter === "all") return true
    if (r.status !== filter) return false
    if (filter === "approved") return mailFilter === "sent" ? Boolean(r.approval_email_sent_at) : !r.approval_email_sent_at
    return true
  })
```

### Task 2: 세부 탭 UI

**Files:**
- Modify: `src/app/admin/buyers/AdminDashboard.tsx:214-229`

- [ ] **Step 1: 상단 탭 onClick 변경** — `onClick={() => setFilter(k)}` →

```tsx
              onClick={() => {
                setFilter(k)
                if (k === "approved") setMailFilter("unsent")
              }}
```

- [ ] **Step 2: 상단 탭 `</div>` 직후에 세부 탭 추가**

```tsx
        {filter === "approved" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(["unsent", "sent"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setMailFilter(k)}
                className={`px-3 py-1.5 rounded text-[12px] font-semibold border transition-colors ${
                  mailFilter === k
                    ? "bg-white text-[#7d0b1c] border-[#7d0b1c]"
                    : "bg-white text-[#666] border-black/10 hover:border-black/25"
                }`}
              >
                {k === "unsent" ? "메일 미발송" : "메일 발송 완료"} {counts[k]}
              </button>
            ))}
          </div>
        )}
```

- [ ] **Step 3: 검증**

Run: `pnpm exec tsc --noEmit && pnpm lint:check`
Expected: 오류 없음

- [ ] **Step 4: 수동 확인** — `pnpm dev` 후 `/admin/buyers`: 승인 탭 진입 시 미발송 선택, 미발송+발송완료 = 승인 수, 메일 발송 후 해당 건이 발송 완료로 이동.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/buyers/AdminDashboard.tsx
git commit -m "feat(admin): 승인 탭에 메일 미발송/발송 완료 세부 탭 추가"
```
