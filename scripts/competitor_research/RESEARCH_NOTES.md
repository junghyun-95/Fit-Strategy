# 주간 리서치 노트 — 2026-09-21

## ⚠️ 이번 주 네트워크 상황 (중요, 지난주와 동일/더 넓은 범위로 재확인)

이번 세션에서도 지난주(2026-09-14)와 동일하게 `WebFetch`가 조사 대상
브랜드 사이트 전부에 대해 세션 egress 정책상 403(`EGRESS_BLOCKED`)으로
차단됨을 실제 요청으로 재확인함(재시도·우회 시도는 하지 않음 —
`/root/.ccr/README.md`: "403/407은 조직 정책 차단이며 재시도·우회 금지").
이번 주는 검증을 위해 브랜드 사이트 외에 `en.wikipedia.org`, `aol.com`,
`heystylehey.com` 등 조사 대상이 아닌 일반 도메인에도 시험 삼아 `WebFetch`를
1회씩 날려봤는데 전부 동일하게 차단되어, 이번 세션은 브랜드 사이트만이
아니라 **`WebFetch` 자체가 거의 전 도메인에 대해 차단**된 상태였음을
확인함. `curl`로 `uniqlo.com:443` CONNECT를 직접 시도해도 프록시 상태
엔드포인트(`recentRelayFailures`)에 "gateway answered 403 to CONNECT
(policy denial)"로 기록됨을 확인함. 이는 헤드리스 브라우저(Playwright)도
동일한 `HTTPS_PROXY` 경로를 타므로 동일하게 차단될 것이 명백해, 이번 주도
Playwright 설치/실행은 시도하지 않음(`package.json`/`package-lock.json`
변경 없음, `git status`로 clean 확인 완료).

`WebSearch`는 이 세션 egress 정책의 영향을 받지 않아 정상 동작했으므로,
지난주와 동일하게 `WebSearch`가 반환하는 색인 스니펫(실제 브랜드
공식 URL 포함)만으로 대체 조사함.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 비고 |
|---|---|---|---|---|---|
| Alo Yoga | WebSearch로 대체 캡처 | 5 (여2/남3) | 0 | 1 | 여성 2건은 실제 상품 상세 URL(w1404r/w1430r) 확보 — 지난주와 동일한 상품/URL로 카탈로그 안정성 확인. 남성 3건은 상품명은 확보했으나 상세 URL 미검색, 컬렉션 페이지 URL로 대체 |
| Lululemon | WebSearch로 대체 캡처 | 5 (여3/남2) | 0 | 4 | `lululemon.co.kr` 대신 글로벌 도메인(`shop.lululemon.com`) 사용. 5건 중 4건이 실제 상품 상세 URL(prod ID 포함) 확보 — 지난주보다 품질 향상 |
| Uniqlo | WebSearch로 대체 캡처 | 4 (여2/남2) | 0 | 1 | `uniqlo.com` 전체가 `WebFetch`/직접 CONNECT 모두 차단(Akamai/조직 정책) 확인됐으나, `WebSearch` 색인에서 `uniqlo.com/us/en/products/...` 형태의 실제 상품 상세 URL 4건을 확보함(지난주는 0건이었음 — 이번 주는 개선) |
| Vuori | WebSearch로 대체 캡처 | 4 (여2/남2) | 0 | 4 | 전부 실제 상품 상세 URL 확보. 여성 2건은 "Oversized" 명시, 남성 2건은 "Relaxed Fit" 명시 |
| On Running | WebSearch로 대체 캡처 | 4 (남3/여1) | 0 | 1 | 전부 실제 상품 상세 URL 확보(`on.com/en-us/products/...`, KR 도메인 아님). 여성 캡처가 1건뿐이라 성비 불균형 — 다음 주 women's apparel 카테고리 위주로 추가 검색 필요 |
| Aritzia (참고용) | WebSearch로 대체 캡처 | 5 (전부 여성) | 0 | 2 | 경쟁사 아님, 별도 파일. 1건은 실제 상품 상세 URL, 4건은 브랜드/카테고리 컬렉션 URL |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 27건(경쟁사 22건 + Aritzia 5건).**
사이즈 차트 페이지를 한 건도 열람하지 못했으므로(WebFetch 전면 차단),
이번 주 draft에도 숫자 스펙(`spec`)은 절대 채우지 않음(하드 룰 준수 —
"모델 착용 사이즈/키" 같은 캘아웃도 치수로 환산하지 않음, 애초에 그런
캘아웃 자체를 열람하지 못함). `fitRaw`는 WebSearch 스니펫에 "Relaxed
Fit", "Boxy", "Classic Fit", "Regular Fit", "Oversized" 등 브랜드 공식
페이지 제목/설명에 명시된 단어가 있을 때만 채웠고, 그 외에는 `null`로
남김.

`dataType`은 스키마상 3개 값 중 하나를 반드시 채워야 해서 지난주와
동일하게 `"ai_estimate"`(가장 낮은 신뢰도 라벨)를 임시로 넣었음. **이는
실제로 AI가 추정한 값이 아니라 "사이트 접근 불가로 수치 자체를 확보하지
못함"을 뜻하는 placeholder이므로, 리뷰 시 다른 값으로 재분류하거나 별도
상태值를 스키마에 추가하는 것을 검토할 것.**

`sourceImageUrl`도 상품 상세 페이지 이미지 태그를 직접 열람하지 못했으므로
전부 `null`로 남김(추측/가공 금지). `sourceUrl`은 WebSearch가 반환한 실제
색인 URL이므로 신뢰 가능함 — 다만 일부(Alo 남성 3건, Aritzia 4건)는
개별 상품이 아닌 브랜드/카테고리 컬렉션 URL이며, 파일 내 각 항목에
브랜드/카테고리 컬렉션 URL임을 알 수 있도록 style 필드에 "(collection)"
표기를 남겼으니 리뷰 시 참고할 것.

## 중요 — 프로덕션 데이터 반영 전 필수 확인사항

**`src/data/marketEntries.json`은 수작업으로 큐레이션된 프로덕션 데이터이며,
이 폴더의 draft 파일은 어디까지나 초안이다. 사람이 직접 리뷰하기 전에는 절대
숫자를 그대로 머지하지 말 것.** 과거 검수 없이 수치를 반영했다가 경쟁사
어깨너비(shoulder) 값이 3832cm로 오타가 나서 대시보드에 그대로 노출된 실제
버그 사례가 있었음 — 이번 주 draft도 그런 사고를 막기 위해 스펙을 전부
비워두었으니, 다음 리서치 실행 시 사이트 접근이 복구되면 실제 사이즈 차트를
열어 직접 확인 후 채워 넣어야 한다.

## 다음 실행 시 확인할 것
- 이번 세션의 `WebFetch` 전면 차단이 2주 연속 관찰됨 — 세션별 일시 정책이
  아니라 이 프로젝트/조직에 대한 지속적인 egress 정책일 가능성이 높으므로,
  관리자에게 "브랜드 리서치용 `WebFetch` 아웃바운드 허용" 여부 확인 필요
  (README 안내에 따라 재시도·우회는 하지 않음).
- 차단이 해소되면 Uniqlo(Akamai), Lululemon 상세페이지(Cloudflare) 등
  기존에 알려진 개별 차단 이슈만 남을 것으로 예상되며, 사이즈 차트 열람 후
  실측 스펙 채우기를 최우선으로 진행할 것.
- On Running 여성 카테고리 캡처 수가 적었으니 다음 주 보강 필요.
