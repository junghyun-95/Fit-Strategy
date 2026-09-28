# 주간 리서치 노트 — 2026-09-28

## ⚠️ 이번 주 네트워크 상황 (3주 연속 동일 패턴 재확인)

이번 세션에서도 지난 2주(2026-09-14, 2026-09-21)와 동일하게 `WebFetch`가
조사 대상 브랜드 사이트 전부에 대해 `EGRESS_BLOCKED` 오류로 차단됨을 실제
요청으로 재확인했다. 브랜드 사이트(`aloyoga.com`)뿐 아니라 조사 대상이
아닌 `en.wikipedia.org`에도 시험 삼아 `WebFetch`를 날려봤는데 동일하게
차단되어, 이번 주도 브랜드별 문제가 아니라 세션 전체의 egress 정책 차단임을
확인했다. `curl`로 `www.uniqlo.com:443`, `vuoriclothing.com:443` CONNECT를
직접 시도해도 프록시 상태 엔드포인트(`recentRelayFailures`)에 "gateway
answered 403 to CONNECT (policy denial or upstream failure)"로 동일하게
기록됨을 확인했다.

세션의 모든 아웃바운드 HTTPS는 `HTTPS_PROXY`(고정 에이전트 프록시)를 반드시
경유하도록 구성되어 있고, 이 프록시를 우회하거나 TLS 검증을 끄는 것은
금지되어 있다(`/root/.ccr/README.md`). 헤드리스 브라우저(Playwright) 역시
같은 프로세스 환경의 `HTTPS_PROXY`를 사용하게 되므로 동일하게 차단될 것이
명백하여, 이번 주도 Playwright 설치·실행은 시도하지 않았다(`package.json`/
`package-lock.json` 변경 없음, 아래 "최종 확인"에서 `git status`로 clean
확인 완료).

`WebSearch`는 이 egress 정책의 영향을 받지 않아 정상 동작했으므로, 지난
2주와 동일하게 `WebSearch`가 반환하는 색인 스니펫(실제 브랜드 공식 URL
포함)만으로 대체 조사했다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 비고 |
|---|---|---|---|---|---|
| Alo Yoga | WebSearch로 대체 캡처 | 5 (여2/남3) | 0 | 2 | 여성 2건(All Day Short Sleeve, Alosoft Finesse Tee)은 실제 상품 상세 URL(w1430r/w1404r) 확보. 남성 3건 중 Triumph Tee는 "Relaxed Fit", Triumph Crew Neck Tee는 "loose-fit raglan sleeves"라는 원문 표현을 fitRaw로 기록. Triumph Muscle Tank는 fit 언급 없어 null |
| Lululemon | WebSearch로 대체 캡처 | 5 (여3/남2) | 0 | 4 | `lululemon.co.kr` 대신 글로벌 도메인(`shop.lululemon.com`) 색인 사용. Women's Boxy T-Shirt/Classic Fit/Relaxed Fit 컬렉션과 남성 Heavyweight Classic-Fit Cotton T-Shirt *Chipinski는 상품 상세 URL 확보, fitRaw는 각 페이지 타이틀에 명시된 문구 그대로 기록 |
| Uniqlo | WebSearch로 대체 캡처 | 4 (여2/남2) | 0 | 2 | `uniqlo.com`은 이번 주도 `WebFetch`/직접 CONNECT 모두 차단(Akamai/조직 정책, 1회 재확인 후 스킵) 확인됨. `WebSearch` 색인에서 남성 "+J Supima Cotton Relaxed-Fit Crew Neck T-Shirt"(명시적 "Relaxed-Fit"), 여성 "Crew Neck T-Shirt"(Uniqlo U, 페이지 설명에 "regular, balanced fit" 명시)를 fitRaw로 기록. 나머지 2건은 fit 언급 없어 null |
| Vuori | WebSearch로 대체 캡처 | 5 (남2/여3) | 0 | 5 | 전부 실제 상품 상세 URL 확보. 남성 2건은 "Relaxed Fit", 여성 3건(Maven Oversized Tee, Heavyweight Oversized Cotton Tee, Energy Tee)은 전부 "Oversized"가 제품명/페이지에 명시됨 |
| On Running | WebSearch로 대체 캡처 | 4 (남2/여2) | 0 | 0 | 전부 실제 상품 상세 URL 확보(`on.com/en-us/products/...`). Focus-T/Core-T 남녀 버전 모두 fit 명칭(Regular/Slim 등)이 스니펫에 없어 fitRaw는 전부 null. 지난주는 여성 캡처가 1건뿐이었는데 이번 주는 Focus-T/Core-T 여성 버전을 각각 확보해 성비를 2/2로 개선함 |
| Aritzia (참고용) | WebSearch로 대체 캡처 | 4 (전부 여성) | 0 | 2 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). Essential Oversized Shirt와 Oversized 컬렉션 2건은 "Oversized" 명시, 일반 T-Shirts 컬렉션 URL 1건은 fit 언급 없음 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 27건(경쟁사 23건 + Aritzia 4건).**
사이즈 차트 페이지를 한 건도 열람하지 못했으므로(`WebFetch` 전면 차단),
이번 주 draft에도 숫자 스펙(`spec`)은 절대 채우지 않았다(하드 룰 준수 —
"모델 착용 사이즈/키" 같은 스타일링 캘아웃도 치수로 환산하지 않음; 애초에
그런 캘아웃 자체를 열람하지 못함). `fitRaw`는 `WebSearch` 스니펫에 브랜드
공식 페이지 제목/설명으로 명시된 단어(예: "Relaxed Fit", "Boxy", "Classic
Fit", "Oversized", "loose-fit raglan sleeves")가 있을 때만 채웠고, 그 외에는
`null`로 남겼다.

참고: 티셔츠 전문 매체 toohoocustom의 일반 설명 기사에는 "박시 핏은 레귤러
대비 가슴/몸통 폭이 3~6cm 넓고 어깨선이 3~6cm 낮다" 류의 수치가 있었으나,
이는 특정 브랜드/제품의 사이즈 차트가 아니라 업계 일반론이므로 하드 룰에
따라 어떤 브랜드의 `spec`에도 반영하지 않았고 `vogue_trend_summary.md`의
정성적 트렌드 서술에만 참고했다.

`dataType`은 스키마상 3개 값 중 하나를 반드시 채워야 해서 지난 2주와
동일하게 `"ai_estimate"`(가장 낮은 신뢰도 라벨)를 임시로 넣었다. **이는
실제로 AI가 추정한 값이 아니라 "사이트 접근 불가로 수치 자체를 확보하지
못함"을 뜻하는 placeholder이므로, 리뷰 시 다른 값으로 재분류하거나 별도
상태값을 스키마에 추가하는 것을 검토할 것.**

`sourceImageUrl`도 상품 상세 페이지의 이미지 태그를 직접 열람하지 못했으므로
전부 `null`로 남겼다(추측/가공 금지). `sourceUrl`은 `WebSearch`가 반환한
실제 색인 URL이므로 신뢰 가능하며, 이번 주는 23건 중 대부분이 개별 상품
상세 URL이고 Aritzia 참고 파일에만 컬렉션 URL이 일부 섞여 있다("(collection)"
표기).

## 중요 — 프로덕션 데이터 반영 전 필수 확인사항

**`src/data/marketEntries.json`는 사람이 직접 큐레이션한 production
데이터이며, 이 draft는 반드시 사람의 검토를 거친 후에만 실제 데이터에
병합되어야 한다 — 과거 competitor shoulder measurement가 3832cm으로 오타
입력되어 대시보드에 실제 버그가 발생한 사례가 있었다.** 이번 주 draft도
그런 사고를 막기 위해 스펙을 전부 비워두었으니, 다음 리서치 실행 시 사이트
접근이 복구되면 실제 사이즈 차트를 직접 열어 확인한 뒤에만 채워 넣을 것.

## 다음 실행 시 확인할 것
- 이번 세션의 `WebFetch`/직접 CONNECT 전면 차단이 3주 연속(9/14, 9/21,
  9/28) 관찰됨 — 세션별 일시 정책이 아니라 이 프로젝트/조직에 대한 지속적인
  egress 정책일 가능성이 매우 높으므로, 관리자에게 "브랜드 리서치용
  아웃바운드 허용" 여부를 확인할 필요가 있다(README 안내에 따라 재시도·
  우회는 하지 않음). 클라우드 환경 설정의 Network access에서 허용 도메인을
  추가하는 방법이 있다.
- 차단이 해소되면 Uniqlo(Akamai), Lululemon 상세페이지(Cloudflare) 등
  기존에 알려진 개별 차단 이슈만 남을 것으로 예상되며, 사이즈 차트 열람 후
  실측 스펙 채우기를 최우선으로 진행할 것.
- On Running 여성 캡처는 이번 주 2건으로 개선했으나 Club-T 등 다른 스타일의
  여성 버전은 `WebSearch` 색인에서 찾지 못했으니 다음 주 추가 검색 필요.
