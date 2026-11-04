// 화면의 SVG 를 PNG 파일로 내려받는다. 서버를 거치지 않고 브라우저에서 바로 만든다.

/** 이미지 안에서는 페이지 CSS·웹폰트를 쓸 수 없어 기기에 있는 글꼴을 직접 지정한다 */
const FONT = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif"

export async function downloadSvgAsPng(svg: SVGSVGElement, fileName: string, scale = 6) {
  const { width, height } = svg.viewBox.baseVal
  const w = width * scale
  const h = height * scale

  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.removeAttribute("class")
  copy.setAttribute("width", String(w))
  copy.setAttribute("height", String(h))
  copy.setAttribute("font-family", FONT)

  // 이미지 안에서는 CSS 변수가 풀리지 않으므로 실제 색으로 바꿔 넣는다
  const css = getComputedStyle(svg)
  const markup = new XMLSerializer()
    .serializeToString(copy)
    .replace(/var\((--[\w-]+)\)/g, (_, name: string) => css.getPropertyValue(name).trim())

  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }))
  try {
    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = () => reject(new Error("배치도 이미지를 만들지 못했습니다."))
      image.src = url
    })

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("배치도 이미지를 만들지 못했습니다.")
    ctx.drawImage(image, 0, 0, w, h)

    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!png) throw new Error("배치도 이미지를 만들지 못했습니다.")

    const link = document.createElement("a")
    link.href = URL.createObjectURL(png)
    link.download = fileName
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } finally {
    URL.revokeObjectURL(url)
  }
}
