# 주간 리서치 노트 — 2026-11-09

## 네트워크 상황 (지난 몇 주와 동일한 패턴 재확인)

이번 주도 이전 주차들과 동일하게, 이 세션의 egress proxy가 브랜드 공식
도메인과 vogue.com을 포함한 외부 일반 도메인 전반을 차단했다. 직접
확인한 내용:

- `curl https://www.aloyoga.com/ko-kr`, `curl https://vuoriclothing.com/` →
  둘 다 `CONNECT tunnel failed, response 403` (agent-proxy 로그:
  `connect_rejected` — "호스트가 이 세션에 허용되지 않음")
- `WebFetch https://www.aloyoga.com/ko-kr` → `getaddrinfo ENOTFOUND`로 동일
  차단, `WebFetch https://www.vogue.com/fashion-shows` → `Claude Code is
  unable to fetch from www.vogue.com`
- `curl "$HTTPS_PROXY/__agentproxy/status"` 확인 결과 `noProxy`에 브랜드
  도메인이 전혀 포함되어 있지 않음 — 허용 목록(allowlist) 미등재 호스트는
  전부 차단되는 구성 재확인
- Playwright: `~/.cache/ms-playwright`는 비어 있었지만, 이 세션에는
  `require('playwright')`로 바로 쓸 수 있는 사전 설치된 Chromium이 있음을
  확인함(`/opt/node22`, `/opt/node-tools` 경로). 다만 해당 브라우저가
  보내는 요청도 동일한 egress proxy를 거치므로, 애초에 `connect_rejected`로
  막힌 호스트(alo/lululemon/uniqlo/vuori/on/vogue 전부)는 헤드리스
  브라우저로 우회할 수 없는 네트워크 레벨 차단임. 따라서 `npm install
  playwright`는 시도하지 않았고 `package.json`/`package-lock.json`
  변경 없음(`git status`로 확인)

따라서 Task 1, 2 전부 `WebSearch` 결과만으로 조사했다. `WebFetch`/직접
`curl`은 전혀 성공하지 않았다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 설명 없음 | 비고 |
|---|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체 | 4 (남2/여2) | 0 | 4 | 0 | 남성: Harrods "Triumph Crew-Neck T-Shirt"(Regular fit), Bloomingdale's "Slim Fit Idol Performance Tee"(상품명 자체가 Slim Fit). 여성: Altitude Sports "Lithe Tee"(Oversized, drop back hem), Bloomingdale's "Cropped All Day Tee"(Cropped) |
| Lululemon | WebSearch 대체 | 3 (남1/여2) | 0 | 3 | 0 | 상품 상세 페이지는 여전히 Cloudflare 봇 체크로 열람 불가하나 WebSearch 스니펫으로 확인. 남성 "Fundamental T-Shirt"(Regular fit, Pima cotton, Flannels 재판매 페이지 설명 기준). 여성 "Classic Jersey Tee"(Classic Fit·Hip Length, boxy)·"Forever Favourite Tee"(Relaxed, 약간 boxy, 긴 길이) 유지. 남성 "Organic Cotton Classic-Fit T-Shirt"는 품절/단종 가능성 언급(고객 문의 응답)이 있어 draft에서 제외 |
| Uniqlo | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 직접 접근은 차단(Akamai 블록 재시도하지 않음). 남성 "U Crew Neck T-Shirt"(E422992, Regular fit)·"AIRism Cotton Oversized Crew Neck Half-Sleeve T-Shirt"(E465185, Oversized) 재확인. 여성은 masterpiece 피처 페이지의 Christophe Lemaire(Uniqlo U 디자인 디렉터) 인용구 유지 |
| Vuori | WebSearch 대체 | 3 (남2/여1) | 0 | 3 | 0 | 남성 2건 공식 `vuoriclothing.com` 상품 상세 URL(Relaxed Fit) 재확인. 여성 "Short Sleeve Heavyweight Cotton Relaxed Tee"(Relaxed, hip 길이) 재확인 |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 2 | 0 | 공식 `on.com` 상품 URL 재확인. Run-T 남/여 모두 "Regular fit" |
| Aritzia (참고용) | WebSearch 대체 | 4 (전부 여성) | 0 | 4 | 0 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). 이번 주 신규 확인: Scavenger T-Shirt(dolman sleeve, Oversized)·Foundation BF T-Shirt(페이지에 "Fit: Oversized" 명시)·Pegasus T-Shirt(Relaxed, "just shy of loose", hip 이하 길이). Brightside T-Shirt(Oversized)는 재확인 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 19건(경쟁사 15건 + Aritzia 4건).**
이번 주도 사이즈 차트 테이블을 한 페이지도 직접 열람하지 못했으므로
(`WebFetch`·`curl` 모두 egress 정책으로 전면 차단), draft에는 숫자 스펙
(`spec`)을 전혀 채우지 않았다 — 하드 룰 준수. WebSearch 결과 요약에
"220 GSM" 같은 수치가 간헐적으로 등장했지만, 이는 사이즈 차트 테이블이
아니라 소재 중량 표기에서 나온 값이라 `spec`에 넣지 않고 제외했다.
"모델 착용 사이즈/키" 캘아웃도 전혀 수치로 환산하지 않았다. `fitRaw`는
브랜드 공식 페이지 본문이나 리테일러 상세페이지가 명시적으로 인용한 fit
용어(예: "Regular fit", "Slim Fit", "Classic Fit, Hip Length", "Fit:
Oversized")가 있을 때만 채웠다.

## Task 1 메모

이번 주 Vogue 대체 트렌드 조사(`vogue_trend_summary.md`)에서는 지난
몇 주의 "오버사이즈 지속" 서사에서 뚜렷한 전환이 포착됐다. NET-A-PORTER가
인용한 Vanessa Friedman(NYT)의 "oversize is over" 발언과 bluewin.ch의
"Goodbye oversized" 보도가 슬림 테일러링 복귀를 뒷받침했고, Who What
Wear·Apparel Resources는 볼륨감이 전신이 아니라 어깨/소매로 국지화됐다고
짚었다. 반면 Task 2에서 확인한 실제 경쟁사 판매 제품은 여전히
Relaxed/Oversized 비중이 높아(Alo 여성, Lululemon 여성, Vuori, Aritzia
전부), 런웨이 보도와 리테일 매대 사이 시차가 이번 주도 유지됨을 본문에
명시했다.

## 중요 — 반드시 확인할 것

`src/data/marketEntries.json`은 수작업으로 큐레이션된 프로덕션 데이터이며,
이번 draft(`brand_products_draft.json`, `reference_brand_aritzia_draft.json`)의
숫자/문구를 그대로 머지하기 전에 반드시 사람이 검토해야 한다. 과거 리뷰
없이 들어간 경쟁사 어깨 측정값 오타(3832cm)가 실제 대시보드 버그로
이어진 적이 있으므로, 이번 draft도 동일한 검증 없이 병합하지 않는다.
