# 주간 리서치 노트 — 2026-10-19

## 이번 주 네트워크 상황 — 중요한 신규 발견

이번 주는 과거 몇 주와 달리 **차단의 성격을 더 구체적으로 확인**했다.
`WebFetch`로 `vogue.com`·`uniqlo.com`뿐 아니라 조사 대상이 아닌
`example.com`, `www.bbc.com`, `www.nytimes.com` 등 임의의 일반 도메인까지
전부 접근 실패(`getaddrinfo ENOTFOUND` 또는 "Claude Code is unable to
fetch")했다. 반면 `www.anthropic.com`은 정상적으로 열렸다. 또한 헤드리스
브라우저(Playwright) 설치를 실제로 시도한 결과, `npx playwright install
chromium`이 브라우저 바이너리 다운로드 단계에서 `cdn.playwright.dev`에
대해 `403 request blocked: no rule or allowlist entry allows host`로
차단되었다 — 즉 Chromium 실행 파일 자체를 받아올 수 없어 헤드리스 브라우저
폴백은 이번 세션에서 원천적으로 사용할 수 없었다.

이를 종합하면, 과거 주차 노트에서 추정했던 "WebFetch 툴 자체의 도메인
차단"이 아니라, **이번 세션의 네트워크 정책이 소수 allowlist 도메인만
허용하는 구조**라는 것이 거의 확실하다(지난주 노트가 `curl` CONNECT
테스트로 조직 정책 차단임을 처음 확인한 것과 같은 결론이며, 이번 주는
Playwright CDN 다운로드 차단까지 추가로 재확인했다). 따라서 Task 2의
5개 경쟁사 + Aritzia 사이트에 대한 `WebFetch`(공식 사이트 6곳 전부)와
Playwright 설치가 모두 실패했으며, 이는 봇 차단(Akamai/Cloudflare)과는
별개의, 더 상위 레이어의 차단이다. (Playwright는 설치 실패 후 `npm
uninstall playwright`로 정리했고, `package-lock.json`에 남은 diff는
`git checkout --`으로 되돌려 현재 `git status`는 clean 상태다.)

`WebSearch`는 정상 동작했으므로, 이번 주도 `WebSearch` 결과(브랜드
공식 도메인 URL이 검색 결과에 포함된 경우 그대로 사용)로 전량 대체
조사했다.

### 스푸핑/클론 사이트 — 이번 주도 재확인

Alo Yoga(`aloyogao.it.com`, `alosyoga.it.com`, `aloyogas.it.com`,
`alsyoga.it.com`)와 Uniqlo(`uniqlloshop.it.com`, `uniqloverse.it.com`,
`uniqlofashion.it.com`) 검색 시 동일한 `.it.com` 모방 도메인이 다수
노출되었다. 이번 주도 draft에는 이 도메인들의 URL을 전혀 사용하지
않았다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 설명 없음 | 비고 |
|---|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 공식 `aloyoga.com` URL은 이번 주도 색인에서 확보 못함. 공인 리테일러(`backcountry.com`, `shop.equinox.com`) URL 사용. **이번 주 신규**: Equinox에서 여성용 "Conquer Reform Crewneck Short Sleeve"(Regular fit)를 찾아 지난주 비어있던 여성 항목을 처음 채웠다 |
| Lululemon | WebSearch 대체 | 5 (남3/여2) | 0 | 5 | 0 | 상품 상세 페이지는 Cloudflare 봇 체크로 열람 불가(패턴 지속), 카테고리 URL을 `sourceUrl`로 사용. Fundamental/Heavyweight Classic-Fit/Classic Jersey Tee는 "Classic fit" 계열, Pique Performer는 "Relaxed fit", Boxy T-Shirt는 "Relaxed, boxy fit" 명시 |
| Uniqlo | WebSearch 대체, 공식 페이지 텍스트 확보 | 2 (남1/여1) | 0 | 2 | 0 | `uniqlo.com` 직접 `WebFetch`는 1회 시도 후 역시 네트워크 정책 차단(위 "신규 발견" 참고)이지만, `WebSearch`가 공식 `uniqlo.com/us/en/products/...` 페이지의 본문 텍스트를 가져와 "Regular fit"(E422992, 남성, 구 U Crew Neck T-Shirt가 Crew Neck T-Shirt로 리네이밍됨)·"Regular, balanced fit"(E424873, 여성) 확인 |
| Vuori | WebSearch 대체 | 5 (남3/여2) | 0 | 5 | 0 | 전부 공식 `vuoriclothing.com` 상품 상세 URL 확보(가장 안정적인 브랜드, 지난주와 동일 패턴). 남성 3건 전부 "Relaxed Fit" 명시, 여성 Energy Tee는 "Oversized, relaxed fit", Energy Tee Long은 "Slouchy fit" 명시 |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 2 | 0 | 공식 `on.com` 상품 상세 URL을 이번 주 검색에서 재확보하지 못해, 추측 URL을 쓰는 대신 공인 리테일러 URL(`centralsports.co.uk`, `roadrunnersports.com`)로 대체. Core-T(남) "Regular fit", Run-T(여) "Relaxed, never-clingy fit" |
| Aritzia (참고용) | WebSearch 대체 | 5 (전부 여성) | 0 | 4 | 1 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). ARO/Brightside/Scavenger T-Shirt(지난주 확인)와 Mixtape T-Shirt(전주 신규 확인, "Oversized, dropped shoulders, semi-sheer slub jersey")는 이번 주도 유효하여 유지. **이번 주 신규**: HomeStretch Smooth Tune T-Shirt(핏한 스트레치 티로 추정)를 추가했으나 페이지에서 명확한 fit 명칭을 확인하지 못해 `fitRaw: null`로 남김 — 오버사이즈 일변도가 아닌 대비 사례로 포함 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 22건(경쟁사 17건 + Aritzia 5건).**
이번 주도 사이즈 차트 테이블을 단 한 페이지도 직접 열람하지 못했으므로
(`WebFetch`·헤드리스 브라우저 모두 네트워크 정책에 의해 전면 차단),
draft에는 숫자 스펙(`spec`)을 전혀 채우지 않았다 — 하드 룰 준수. "모델
착용 사이즈/키" 같은 스타일링 캘아웃도 수치로 환산하지 않았다(해당
캘아웃 자체를 열람하지 못했으므로 원천적으로 발생하지 않음). `fitRaw`는
브랜드 공식 페이지 본문이나 `WebSearch` 요약이 명시적으로 인용한 fit
용어(예: "Relaxed Fit", "Classic fit", "Regular, balanced fit", "Slouchy
fit")가 있을 때만 채웠고, 모호하거나 확인되지 않은 경우(Aritzia
HomeStretch 등)는 `null`로 남겼다.

**집계: 실측(cm) 0건 / fit 설명만 21건 / 설명 없음 1건 (전체 22건).**

## ⚠️ 중요 — 반드시 숙지할 것

`src/data/marketEntries.json`은 수작업으로 큐레이션된 **운영 데이터**이며,
이 폴더의 draft 파일들은 어떤 경우에도 자동으로 병합되어서는 안 된다.
**반드시 사람이 각 항목을 검토(실측 여부 확인, 수치 재검증, 이미지/URL
유효성 확인)한 뒤에만** `marketEntries.json`에 반영해야 한다. 과거에
경쟁사 어깨너비가 "3832cm"로 오타 입력되어 대시보드에 그대로 노출된
사고가 있었으므로, 리뷰 없는 자동 반영은 금지한다.

## 최종 확인

- `package.json`: 변경 없음.
- `package-lock.json`: Playwright 설치 시도로 일시적으로 54줄 diff가
  발생했으나, `npm uninstall playwright` 후 남은 diff를 `git checkout --
  package-lock.json`으로 되돌려 현재 clean 상태(`git status`로 확인).
- `src/`, 기타 production 코드: 변경 없음.
