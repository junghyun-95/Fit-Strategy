# 주간 리서치 노트 — 2026-11-16

## 네트워크 상황 (지난 몇 주와 동일한 패턴 재확인)

이번 주도 이전 주차들과 동일하게, 이 세션의 egress 정책이 브랜드 공식
도메인과 vogue.com을 포함한 외부 일반 도메인을 전반적으로 차단했다.
직접 확인한 내용(지시사항대로 재확인은 한 번씩만 시도):

- `WebFetch https://www.vogue.com/fashion-shows` → `Claude Code is unable
  to fetch from www.vogue.com` (도메인 레벨 차단)
- `WebFetch https://www.aloyoga.com/ko-kr` → `getaddrinfo ENOTFOUND
  www.aloyoga.com` (세션에 허용되지 않은 호스트)
- `curl "$HTTPS_PROXY/__agentproxy/status"` 확인 결과 `noProxy` 목록에
  브랜드 도메인이 전혀 포함되어 있지 않음 — 허용 목록 미등재 호스트는
  전부 차단되는 구성 재확인

이 차단은 봇 탐지/Cloudflare/Akamai 같은 애플리케이션 레벨 차단이 아니라
네트워크(DNS/egress) 레벨 차단이므로, 헤드리스 브라우저(Playwright)로도
우회되지 않는다. 따라서 이번 주도 `npm install playwright`는 시도하지
않았다. `git status`로 `package.json`/`package-lock.json` 변경이 없음을
확인했다.

Task 1·2 전부 `WebSearch` 결과만으로 조사했다. `WebFetch`/직접 `curl`은
브랜드 도메인·vogue.com에서 전혀 성공하지 않았다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 설명 없음 | 비고 |
|---|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체 | 4 (남2/여2) | 0 | 4 | 0 | 남성: Backcountry "Tranquility T-Shirt (Long-Sleeve)"(Regular-fit crew), Bloomingdale's "Slim Fit Idol Performance Tee"(상품명 자체가 Slim Fit). 여성: Altitude Sports "Lithe Tee"(Alo 공식 설명상 "오버사이즈 클래식 티"), Bloomingdale's "Cropped All Day Tee"(Cropped) — 지난주와 동일 제품으로 재확인 |
| Lululemon | WebSearch 대체 | 3 (남1/여2) | 0 | 3 | 0 | 상품 상세 페이지는 여전히 Cloudflare 봇 체크로 열람 불가하나 WebSearch 스니펫으로 확인. 남성 "Everyday Cotton-Blend Classic T-Shirt"(Classic Fit, Fall 2026 드롭). 여성 "Forever Favourite Tee"(Relaxed Fit, Bum-Covering Length, slightly boxy)·"Classic Jersey Tee"(Classic Fit, Hip Length) |
| Uniqlo | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 직접 접근은 차단(재시도하지 않음). 남성 "U Crew Neck T-Shirt"(E422992, US 상품 Function details 페이지에 "Fit: Regular" 명시)·"AIRism Cotton Oversized Crew Neck Half-Sleeve T-Shirt"(E465185, Oversized) 재확인. 여성은 "AIRism Relaxed T-Shirt"(E474415, Canada 상품 페이지, moderate crew neck·side slits의 relaxed/oversized 핏)로 신규 확인 |
| Vuori | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 남성 2건 공식 `vuoriclothing.com` 상품 상세 URL(Relaxed Fit, Heavyweight Cotton Tee·Strato Tech Tee) 재확인. 여성 "Short Sleeve Heavyweight Cotton Relaxed Tee"(Relaxed, hip 길이) 재확인 |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 2 | 0 | 공식 `on.com` 상품 URL 재확인. Run-T 남/여 모두 "Regular fit" |
| Aritzia (참고용) | WebSearch 대체 | 4 (전부 여성) | 0 | 4 | 0 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). ARO T-Shirt(Oversized, dropped shoulders)·Pegasus T-Shirt(Relaxed, hip-length)·Foundation BF T-Shirt(Oversized crewneck)·Key Cotton Thessa T-Shirt(Boxy, relaxed) 재확인 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 19건(경쟁사 15건 + Aritzia 4건).**
이번 주도 사이즈 차트 테이블을 한 페이지도 직접 열람하지 못했으므로
(`WebFetch`·`curl` 모두 egress 정책으로 전면 차단), draft에는 숫자 스펙
(`spec`)을 전혀 채우지 않았다 — 하드 룰 준수. WebSearch 결과 요약에
"220 GSM" 같은 수치가 간헐적으로 등장했지만, 이는 사이즈 차트 테이블이
아니라 소재 중량(GSM) 표기에서 나온 값이라 `spec`에 넣지 않고 제외했다.
"모델 착용 사이즈/키" 캘아웃(예: On Run-T 모델 180cm/사이즈 S)도 전혀
수치로 환산하지 않았다. `fitRaw`는 브랜드 공식 페이지 본문이나 리테일러
상세페이지가 명시적으로 인용한 fit 용어(예: "Regular fit", "Slim Fit",
"Classic Fit, Hip Length", "Relaxed Fit")가 있을 때만 채웠다.

## Task 1 메모

이번 주 Vogue 대체 트렌드 조사(`vogue_trend_summary.md`)에서는 NET-A-PORTER·
Apparel Resources·Nylon이 공통적으로 슬림/테일러드 복귀를 보도했고,
Who What Wear는 볼륨감이 전신이 아니라 팬츠/소매 등 특정 부위로
재배치되고 있다고 짚었다. Task 2에서 확인한 실제 경쟁사 판매 제품은
여전히 Relaxed/Oversized 비중이 높아(Alo 여성, Lululemon 여성, Vuori,
Aritzia 전반), 런웨이 보도와 리테일 매대 사이의 시차가 이번 주도
유지된다.

## 중요 — 데이터 반영 전 필수 검토

`src/data/marketEntries.json`은 수작업으로 큐레이션된 프로덕션 데이터다.
이 draft(`brand_products_draft.json`, `reference_brand_aritzia_draft.json`)의
숫자/문구를 그 어떤 것도 리뷰 없이 머지해서는 안 된다. 과거 한 번,
검토되지 않은 수작업 입력에서 경쟁사 숄더 치수가 `3832cm`로 오타가 나
대시보드에 눈에 띄는 버그가 발생한 사례가 있었다 — 이번 draft도 동일한
위험을 피하기 위해 사람 검토를 거쳐야 한다.
