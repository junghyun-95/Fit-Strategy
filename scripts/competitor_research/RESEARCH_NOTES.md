# 주간 리서치 노트 — 2026-11-02

## 네트워크 상황 (지난 몇 주와 동일한 패턴 재확인)

이번 주도 이전 주차들과 동일하게, 이 세션의 egress proxy가 브랜드 공식
도메인을 포함한 외부 일반 도메인 전반을 차단했다. 직접 확인한 내용:

- `curl https://www.aloyoga.com/ko-kr` → `CONNECT tunnel failed, response 403`
  (agent-proxy 로그: `connect_rejected` — "호스트가 이 세션에 허용되지 않음")
- `WebFetch https://www.aloyoga.com/ko-kr` → `getaddrinfo ENOTFOUND`로 동일하게 차단
- `curl "$HTTPS_PROXY/__agentproxy/status"` 확인 결과 `noProxy`에 브랜드
  도메인이 전혀 포함되어 있지 않아, 허용 목록(allowlist) 미등재 호스트는
  전부 차단되는 구성임을 재확인
- Playwright/헤드리스 브라우저 설치는 시도하지 않음 (어차피 `npm install`
  대상 레지스트리 외 다른 다운로드는 동일하게 차단될 것으로 판단, 지난
  몇 주 기록과 동일) → `package.json`/`package-lock.json` 변경 없음

따라서 Task 1, 2 전부 `WebSearch` 결과만으로 조사했다. `WebFetch`/직접
`curl`은 전혀 성공하지 않았다.

### 스푸핑/클론 사이트 주의

이번 주 검색에서도 `vuoriclothingshop.it.com` 등 공식 도메인을 모방한
사이트가 노출되었다. draft에는 이 도메인의 URL을 사용하지 않았다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 설명 없음 | 비고 |
|---|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체 | 4 (남2/여2) | 0 | 4 | 0 | 공식 `aloyoga.com` 상품 페이지는 검색 색인에서 확보 못함. 남성은 Harrods("Conquer Reform T-shirt", Regular fit)·Backcountry("Energy Crew Shirt", Slim fit) 재확인. 여성은 Nordstrom 경유 대신 Altitude Sports에서 "Lithe Tee"(Oversized, 품절)·"Echo Tee"(Cropped, 품절)로 교체 — 품절 표시가 있으나 실제 판매 이력이 있는 제품이라 fit 참고용으로 유지 |
| Lululemon | WebSearch 대체 | 4 (남1/여3) | 0 | 4 | 0 | 상품 상세 페이지는 여전히 Cloudflare 봇 체크로 열람 불가. 남성은 `lululemon.com.hk`에서 "Fundamental T-Shirt"(Classic fit) 재확인. 여성은 "Classic Jersey Tee"(Classic Fit·Hip Length, boxy) 신규 확인 + 기존 "Forever Favourite Tee"·"Women's Boxy T-Shirt" 유지 |
| Uniqlo | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 직접 접근은 차단. `WebSearch`가 `uniqlo.com` 공식 페이지 본문을 가져와 "AIRism Cotton Oversized Crew Neck T-Shirt"(E465185, Oversized)·"U Crew Neck T-Shirt"(E422992, Regular) 재확인. 여성은 masterpiece 피처 페이지에서 Christophe Lemaire(Uniqlo U 디자인 디렉터) 인용구("neither too tight nor too straight")로 fit 서술 확인 |
| Vuori | WebSearch 대체 | 5 (남2/여3) | 0 | 5 | 0 | 남성 2건은 공식 `vuoriclothing.com` 상품 상세 URL 유지(Relaxed Fit). 여성은 이번 주 공식 사이트에서 직접 확보: "Short Sleeve Heavyweight Cotton Relaxed Tee"(Relaxed, hip 길이)·"Heavyweight Cotton Varsity Tee"(Oversized)·"Short Sleeve Heavyweight OS Cotton Tee"(Oversized) |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 2 | 0 | `on.com` 공식 상품 URL(미국 사이트) 확보. Run-T 남/여 모두 "Regular fit" |
| Aritzia (참고용) | WebSearch 대체 | 4 (전부 여성) | 0 | 4 | 0 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). Brightside(Oversized)·Aro(dropped shoulder)·Scavenger(Oversized)·Foundation Relaxed(Relaxed, dropped shoulder) 전부 공식 `aritzia.com` 상품 페이지에서 확인 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 22건(경쟁사 18건 + Aritzia 4건).**
이번 주도 사이즈 차트 테이블을 한 페이지도 직접 열람하지 못했으므로
(`WebFetch`·`curl` 모두 egress 정책으로 전면 차단), draft에는 숫자 스펙
(`spec`)을 전혀 채우지 않았다 — 하드 룰 준수. 검색 결과 요약에 "29인치
길이", "220 GSM" 같은 수치가 간헐적으로 등장했지만, 이는 사이즈 차트
테이블이 아니라 상품 설명/소재 표기에서 나온 값이라 `spec`에 넣지 않고
제외했다. "모델 착용 사이즈/키" 캘아웃도 전혀 수치로 환산하지 않았다.
`fitRaw`는 브랜드 공식 페이지 본문이나 `WebSearch` 요약이 명시적으로
인용한 fit 용어(예: "Relaxed Fit", "Classic Fit, Hip Length", "Regular
fit", "Oversized fit")가 있을 때만 채웠다.

## Task 1 메모

이번 주 Vogue 대체 트렌드 조사(`vogue_trend_summary.md`)에서는 지난
몇 주의 "오버사이즈 일변도" 서사와 달리, FW26 런웨이 보도(Marie Claire,
Hypebeast, Coveteur, Who What Wear)에서 슬림/구조화 복귀 신호가 다수
발견되어 양극화 서사로 갱신했다. Task 2에서 확보한 실제 판매 제품은
여전히 Relaxed/Oversized 비중이 높아, 런웨이와 리테일 매대 사이 시차가
있음을 본문에 명시했다.

## 중요 — 반드시 확인할 것

`src/data/marketEntries.json`은 수작업으로 큐레이션된 프로덕션 데이터이며,
이번 draft(`brand_products_draft.json`, `reference_brand_aritzia_draft.json`)의
숫자/문구를 그대로 머지하기 전에 반드시 사람이 검토해야 한다. 과거 리뷰
없이 들어간 경쟁사 어깨 측정값 오타(3832cm)가 실제 대시보드 버그로
이어진 적이 있으므로, 이번 draft도 동일한 검증 없이 병합하지 않는다.
