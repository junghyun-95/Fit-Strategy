# 주간 리서치 노트 — 2026-10-05

## 이번 주 네트워크 상황

지난 3주(09-14, 09-21, 09-28)와 동일하게 `WebFetch`가 조사 대상 브랜드
사이트에 대해 `EGRESS_BLOCKED`로 차단됨을 이번 주에도 실제 요청으로
재확인했다(`www.aloyoga.com` 테스트). 프록시 상태(`/__agentproxy/status`)의
`recentRelayFailures`는 비어 있었는데, 이는 프록시 중계 실패가 아니라
WebFetch 툴 자체의 도메인 차단이 더 상위에서 걸리는 것으로 보인다.
헤드리스 브라우저(Playwright)도 동일 프로세스의 `HTTPS_PROXY`를 사용하므로
같은 차단을 받을 것이 명백하여, 이번 주도 Playwright 설치·실행을
시도하지 않았다(`package.json`/`package-lock.json` 변경 없음 — 아래
"최종 확인" 참고).

`WebSearch`는 정상 동작하여, 지난 3주와 동일하게 `WebSearch` 색인
결과(실제 브랜드 공식 URL 포함 시 그대로 사용)로 대체 조사했다.

### ⚠️ 신규 발견: 검색 결과에 스푸핑/클론 사이트 혼입

이번 주 Alo Yoga·Uniqlo 관련 검색에서 `aloyogas.it.com`,
`alsyoga.it.com`, `alloyoggashop.it.com`, `uniqloverse.it.com`,
`uniqlofashion.it.com` 등 `.it.com` 도메인의 브랜드명 모방 사이트가
다수 노출되었다. 이들은 동일 상품을 반복 게시하며 "65% 할인" 같은
전형적인 스캠 패턴을 보여 공식 브랜드 사이트가 아님이 명확하다.
**이번 주 draft에는 이 도메인들의 URL을 전혀 사용하지 않았다.**
Alo Yoga의 경우 공식 `aloyoga.com` 상품 URL이 검색 색인에서 전혀
발견되지 않아(지난주 production 데이터에는 `aloyoga.com/ko-kr/products/...`
실링크가 있었던 것과 대비됨), 이번 주 Alo Yoga 3건은 공식 사이트
대신 공인된 리테일러(`backcountry.com`, `shop.equinox.com`) 상품 URL을
`sourceUrl`로 기록했다. 다음 주 리서치 시 공식 `aloyoga.com` 링크
재확보를 다시 시도할 필요가 있다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 비고 |
|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체, 공식 도메인 URL 미확보 | 3 (전부 남성) | 0 | 2 | 공식 `aloyoga.com` URL이 색인에 없어 리테일러(backcountry, equinox) URL로 대체. Energy Crew Shirt "Slim silhouette", Idol Long Sleeve "Slim, relaxed fit"는 명시적 fit 문구. Triumph Tee는 fit 명칭 없어 null. 여성 제품은 검증 가능한 공식 링크를 찾지 못해 이번 주는 캡처하지 않음 |
| Lululemon | WebSearch 대체 | 5 (여2/남3) | 0 | 4 | `shop.lululemon.com` 카테고리 URL 사용(상품 상세 페이지는 Cloudflare 봇 체크로 열람 불가, 지난주와 동일 패턴). Classic Jersey Tee/Fundamental T-Shirt/Organic Cotton Classic-Fit T-Shirt는 "Classic fit" 명시, Forever Favourite Tee는 "slightly boxy cut" 명시. Heavyweight Cotton Jersey T-Shirt는 fit 명칭 없어 null |
| Uniqlo | WebSearch 대체 | 3 (여2/남1) | 0 | 3 | `uniqlo.com`은 일반 egress 차단(Akamai 개별 이슈가 아니라 이번 주는 전체 WebFetch 차단과 동일 선상)으로 1회 확인 후 스킵. U Crew Neck T-Shirt 남성은 "New Classic"(균형 잡힌 핏) 개념 명시, 여성 버전은 "regular, balanced fit" 명시. E424873 여성 크루넥은 "regular fit" 명시 |
| Vuori | WebSearch 대체 | 5 (남3/여2) | 0 | 5 | 전부 공식 `vuoriclothing.com` 상품 상세 URL 확보(가장 안정적). 남성 3건 전부 "Relaxed Fit" 명시, 여성 Energy Tee는 "Oversized, generous fit" 명시, Energy Tee Long은 "slouchy fit" 명시 |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 0 | 지난주(4건) 대비 축소 — 이번 주는 공식 `on.com` 상품 상세 URL이 확보된 Core-T(남)·Focus-T(여) 2건만 기록. 둘 다 "Regular fit" 명시. Focus-T 남성/Core-T 여성의 공식 상품 URL은 이번 검색에서 확보하지 못해 추측 URL을 쓰지 않고 제외함 |
| Aritzia (참고용) | WebSearch 대체 | 3 (전부 여성) | 0 | 3 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). ARO/Brightside/Scavenger T-Shirt 전부 공식 `aritzia.com` 상품 URL 확보, 전부 "Oversized" 계열 fit 명시 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 21건(경쟁사 18건 + Aritzia 3건).**
이번 주도 사이즈 차트 페이지를 한 건도 열람하지 못했으므로(`WebFetch`
전면 차단), draft에는 숫자 스펙(`spec`)을 전혀 채우지 않았다(하드 룰
준수 — "모델 착용 사이즈/키" 같은 스타일링 캘아웃도 치수로 환산하지
않음; 해당 캘아웃 자체를 열람하지 못했으므로 원천적으로 발생하지
않음). `fitRaw`는 브랜드 공식 페이지 제목/설명에 명시된 단어(예:
"Relaxed Fit", "Classic fit", "Oversized", "slouchy fit")가 검색 결과
스니펫에 그대로 드러났을 때만 채웠고, 모호한 경우(예: "comfortable
fit" 같은 일반 수식어)는 `null`로 남겼다.

## ⚠️ 중요 — 반드시 숙지할 것

`src/data/marketEntries.json`은 수작업으로 큐레이션된 **운영 데이터**이며,
이 폴더의 draft 파일들은 어떤 경우에도 자동으로 병합되어서는 안 된다.
**반드시 사람이 각 항목을 검토(실측 여부 확인, 수치 재검증, 이미지/URL
유효성 확인)한 뒤에만** `marketEntries.json`에 반영해야 한다. 과거에
경쟁사 어깨너비가 "3832cm"로 오타 입력되어 대시보드에 그대로 노출된
사고가 있었으므로, 리뷰 없는 자동 반영은 금지한다.

## 최종 확인

- `package.json` / `package-lock.json`: 이번 주도 Playwright를 설치하지
  않았으므로 변경 없음 (`git status`로 clean 확인).
- `src/`, 기타 production 코드: 변경 없음.
