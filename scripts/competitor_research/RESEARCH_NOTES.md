# 주간 리서치 노트 — 2026-10-12

## 이번 주 네트워크 상황 (중요 변화)

지난 4주는 `WebFetch` 툴에서 `EGRESS_BLOCKED`를 관찰했지만 원인이
WebFetch 자체의 제약인지 네트워크 정책인지는 추정에 머물렀다. 이번
주는 `curl`로 egress 프록시에 직접 CONNECT를 시도해 원인을 명확히
특정했다:

```
curl: (56) CONNECT tunnel failed, response 403
www.aloyoga.com:443 — connect_rejected (... organization policy ...)
vuoriclothing.com:443 — connect_rejected (... organization policy ...)
www.lululemon.co.kr:443 — connect_rejected (... organization policy ...)
www.uniqlo.com:443 — connect_rejected (... organization policy ...)
www.on.com:443 — connect_rejected (... organization policy ...)
www.aritzia.com:443 — connect_rejected (... organization policy ...)
```

조사 대상 6개 브랜드 도메인 전부가 **조직 네트워크 정책 레벨에서
차단**됨을 확인했다(WebFetch 툴 한정 문제가 아님). Playwright 등
헤드리스 브라우저도 동일 egress 프록시를 거치므로 같은 차단을 받을
것이 확정적이라 이번 주도 설치를 시도하지 않았다(`package.json`/
`package-lock.json` 변경 없음 — 아래 "최종 확인" 참고). `WebSearch`는
정상 동작하여 지난 4주와 동일하게 색인 결과로 대체 조사했다.

### ⚠️ 스푸핑/클론 사이트 — 이번 주도 혼입 확인

이번 주도 `aloyogas.it.com`, `aloyogao.it.com`, `alsyoga.it.com`,
`uniqloverse.it.com`, `uniqlofashion.it.com`, `vuoriclothingshop.it.com`
등 `.it.com` 브랜드명 모방 도메인이 검색 결과에 다수 노출됐다. 이번
주 draft에도 이 도메인들의 URL을 전혀 사용하지 않았다.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 비고 |
|---|---|---|---|---|---|
| Alo Yoga | WebSearch 대체, 공식 도메인 URL 미확보 | 2 (전부 남성) | 0 | 2 | 5주 연속 공식 `aloyoga.com` 상품 URL이 색인에 없음. 지난주 draft에 있던 "Triumph Tee" 항목은 실제로는 Energy Crew Shirt와 동일한 backcountry URL이 잘못 붙어있던 오류였음을 이번 주 재검증 중 발견 — 이번 주는 그 항목을 삭제하고 URL이 정확히 맞는 2건(backcountry, equinox)만 남김. 여성 제품은 이번 주도 공식/신뢰 가능한 리테일러 URL을 확보하지 못해 캡처하지 않음 |
| Lululemon | WebSearch 대체 | 5 (여4/남1) | 0 | 5 | `shop.lululemon.com` 카테고리 URL 사용(상품 상세는 Cloudflare 봇 체크로 열람 불가, 동일 패턴 지속). 여성 카테고리에서 Classic Jersey Tee("fitted-but-comfortable"), Little Ribbed Tee("hugs the body" → 바디헉 핏), Forever Favourite Tee("slightly boxy cut"), Going Steady Tee("drapes loosely" → 루즈 드레이프)로 4건 다양하게 확보. 남성은 Fundamental T-Shirt 1건만("Classic Fit, roomy through chest/waist" — 단, 다른 리테일러는 동일 제품을 "regular fit"으로도 표기해 라벨이 소스마다 불일치함을 메모) |
| Uniqlo | WebSearch 대체 | 3 (여2/남1) | 0 | 3 | `uniqlo.com`은 Akamai/일반 egress 차단 재확인 후 1회 시도로 스킵. 남성 U Crew Neck T-Shirt는 "New Classic"(균형 핏) 명시. 여성 E424873(미국 페이지)은 "regular, balanced fit, straight silhouette" 명시. 단, 싱가포르/호주 페이지는 동일 계열 제품을 "regular"로, 캐나다/필리핀 페이지는 "close-fitting"/"well-fitted"로 표기해 지역별 핏 라벨링이 불일치 — 이번 주는 미국 공식 페이지 표기를 기준으로 기록 |
| Vuori | WebSearch 대체 | 5 (남3/여2) | 0 | 5 | 전부 공식 `vuoriclothing.com` 상품 상세 URL 확보. 남성 3건 전부 "Relaxed Fit" 계열 명시(그 중 1건은 "loose fit from chest through bottom with no waist definition"까지 구체 서술). 여성 Energy Tee는 "Oversized, relaxed, dropped shoulders", Energy Tee Long은 "slouchy fit" |
| On Running | WebSearch 대체 | 2 (남1/여1) | 0 | 2 | 공식 `on.com` 상품 URL이 확보된 Core-T(남)·Focus-T(여) 2건만 기록(지난주와 동일 수준). Core-T는 리테일러 팩트시트에서 "standard fit" 확인, Focus-T는 "regular fit" 확인 |
| Aritzia (참고용) | WebSearch 대체 | 4 (전부 여성) | 0 | 4 | 경쟁사 아님, 별도 파일(`reference_brand_aritzia_draft.json`). 지난주 3건(ARO/Brightside/Scavenger) 외에 이번 주 신규로 **Mixtape T-Shirt**("oversized, dropped shoulders, semi-sheer slub jersey") 추가 확인. 4건 전부 "Oversized" 계열 fit 명시 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 21건(경쟁사 17건 + Aritzia 4건).**
이번 주도 사이즈 차트 페이지를 한 건도 직접 열람하지 못했으므로
(egress 전면 차단, 위 참고), draft에는 숫자 스펙(`spec`)을 전혀
채우지 않았다 — 하드 룰 준수. 검색 결과 요약 중 일부(예: Lululemon
Fundamental T-Shirt의 "XS 36인치–L 42인치" 체스트 사이즈, Vuori
일부 리스팅의 "29인치 바디 길이")는 수치처럼 보이지만 (1) 인치 단위이고
(2) 실제 사이즈 차트 표를 직접 열람해 확인한 것이 아니라 검색 스니펫의
2차 서술이라, 이번 주도 `spec`에 반영하지 않고 버렸다. `fitRaw`는
브랜드 공식 페이지/리테일러 페이지에 명시된 단어(예: "Relaxed Fit",
"Classic Fit", "Oversized", "New Classic")가 검색 결과에 그대로
드러났을 때만 채웠다.

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
