# 주간 리서치 노트 — 2026-10-26

## 네트워크 상황 (지난 몇 주와 동일한 패턴 재확인)

이번 주도 이전 주차들과 동일하게, 이 세션의 egress proxy가 브랜드 공식
도메인을 포함한 외부 일반 도메인 전반을 차단했다. 직접 확인한 내용:

- `WebFetch https://www.aloyoga.com/ko-kr` → `getaddrinfo ENOTFOUND www.aloyoga.com`
- `curl https://www.aloyoga.com/ko-kr` → `CONNECT tunnel failed, response 403`
  (agent-proxy 로그: `connect_rejected` — "호스트가 이 세션에 허용되지 않음")
- `curl https://cdn.playwright.dev` → 동일하게 `403 connect_rejected`
- 대조군으로 `WebFetch https://www.anthropic.com`은 정상 응답 — 즉 임의
  외부 도메인이 아니라 allowlist에 없는 호스트만 차단되는 것으로 재확인.
- `~/.cache/ms-playwright` 캐시 없음 → Playwright를 쓰려면 매번 Chromium을
  새로 받아야 하는데, 그 다운로드 자체가 차단되므로 헤드리스 브라우저
  폴백은 이번 세션에서도 원천적으로 사용할 수 없었다(설치를 시도하지
  않았으므로 `package.json`/`package-lock.json`에 변경 없음, `git status`
  clean 유지).

따라서 Task 2의 5개 경쟁사 + Aritzia 공식 사이트 6곳 전부에 대해
`WebFetch`/헤드리스 브라우저가 모두 차단되어, 지난 몇 주와 동일하게
`WebSearch` 결과(브랜드 공식 도메인 URL이 검색 결과에 포함된 경우 우선
사용, 없으면 공인 리테일러 URL로 대체)로 전량 조사했다.

### 스푸핑/클론 사이트 주의

이번 주 검색에서도 `vuoriclothingshop.it.com` 등 공식 도메인을 모방한
사이트가 노출되었다. draft에는 이 도메인의 URL을 사용하지 않았다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 설명 없음 | 비고 |
|---|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 공식 `aloyoga.com`/`alo.com` URL은 이번 주도 색인에서 확보 못함. 남성 2건은 공인 리테일러(Backcountry, Equinox)로 지난주와 동일. 여성은 지난주 Equinox 항목을 재확인하지 못해, 대신 Nordstrom에서 "Afterglow Tee"(Cropped fit)를 신규로 확인해 교체 |
| Lululemon | WebSearch 대체 | 5 (남2/여3) | 0 | 5 | 0 | 상품 상세 페이지는 여전히 Cloudflare 봇 체크/네트워크 차단으로 열람 불가, 카테고리 URL 또는 2차 보도(Yahoo)를 `sourceUrl`로 사용. 여성 쪽에서 이번 주 신규로 "Forever Favourite Tee"(Slightly boxy)·"Going Steady Tee"(Loose drape)를 카테고리 페이지 설명에서 확인 |
| Uniqlo | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 직접 `WebFetch`는 1회 시도 후 역시 네트워크 차단(위 참고)이지만 `WebSearch`가 `uniqlo.com` 공식 상품 페이지 본문을 가져와 "Regular fit"(E422992, 男/unisex)·"Regular, balanced fit"(E424873, 女) 재확인, 이번 주 신규로 "Oversized fit"(E465185, AIRism Cotton Oversized T-Shirt, unisex/男 사이징)을 추가 확인 |
| Vuori | WebSearch 대체 | 5 (남2/여3) | 0 | 5 | 0 | 남성 2건은 공식 `vuoriclothing.com` 상품 상세 URL 확보(전 품목 "Relaxed Fit"). 여성은 이번 주 전면 교체: Simons("Energy Loose T-Shirt", 드롭 숄더/긴 밑단), Snow+Rock("Energy Tee", Relaxed), Sports Basement("Energy Classic Tee", 하이힙까지 오는 Relaxed) — 전부 공인 리테일러 경유 |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 2 | 0 | 이번 주는 `on.com` 자체(지역별 사이트: en-gb, en-ca)의 상품 페이지 URL을 직접 확보(지난주는 공인 리테일러로 대체했음). Run-T 남/여 모두 "Regular fit" |
| Aritzia (참고용) | WebSearch 대체 | 3 (전부 여성) | 0 | 3 | 0 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). Brightside/ARO/Scavenger T-Shirt 3건 모두 공식 `aritzia.com` 상품 페이지에서 "Oversized" 계열 fit 재확인. 지난주 포함했던 HomeStretch/Mixtape는 이번 주 검색에서 재노출되지 않아 draft에서 제외(추측 유지 대신 이번 주 확인된 것만 반영) |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 21건(경쟁사 18건 + Aritzia 3건).**
이번 주도 사이즈 차트 테이블을 단 한 페이지도 직접 열람하지 못했으므로
(`WebFetch`·헤드리스 브라우저 모두 네트워크 정책에 의해 전면 차단),
draft에는 숫자 스펙(`spec`)을 전혀 채우지 않았다 — 하드 룰 준수. Vuori
헤비웨이트 티의 "29인치 길이" 같은 단일 수치가 검색 결과 요약에 등장했지만,
이는 사이즈 차트 테이블이 아니라 상품 설명 한 줄에서 나온 값이라 신뢰도를
확인할 수 없어 `spec`에 넣지 않고 제외했다. "모델 착용 사이즈/키" 캘아웃도
전혀 수치로 환산하지 않았다. `fitRaw`는 브랜드 공식 페이지 본문이나
`WebSearch` 요약이 명시적으로 인용한 fit 용어(예: "Relaxed Fit", "Classic
fit", "Regular, balanced fit", "Slightly boxy cut", "Oversized fit")가
있을 때만 채웠다.

## 중요 — 반드시 확인할 것

`src/data/marketEntries.json`은 수작업으로 큐레이션된 프로덕션 데이터이며,
이번 draft(`brand_products_draft.json`, `reference_brand_aritzia_draft.json`)의
숫자/문구를 그대로 머지하기 전에 반드시 사람이 검토해야 한다. 과거 리뷰
없이 들어간 경쟁사 어깨 측정값 오타(3832cm)가 실제 대시보드 버그로
이어진 적이 있으므로, 이번 draft도 동일한 검증 없이 병합하지 않는다.
