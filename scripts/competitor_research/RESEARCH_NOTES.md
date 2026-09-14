# 주간 리서치 노트 — 2026-09-14

## ⚠️ 이번 주 네트워크 상황 (중요)

이번 세션에서는 `vogue.com`뿐 아니라 조사 대상으로 지정된 **5개 경쟁사 사이트
전부 + Aritzia 전부**가 세션 네트워크 egress 정책(organization policy)에 의해
`WebFetch`/`curl` 요청 단계에서 403으로 차단됨을 확인함
(`/root/.ccr/README.md` 기준 "403/407은 조직 정책 차단이며 재시도·우회
금지"). 헤드리스 브라우저(Playwright)도 동일한 네트워크 경로(HTTPS_PROXY)를
타므로 동일하게 차단될 것으로 판단해 별도 설치는 시도하지 않음(따라서
package.json/package-lock.json 변경 없음, `git status` clean 확인).

이는 이전 실행 기록에 남아있는 "Uniqlo만 Akamai 차단", "Lululemon 상세페이지만
Cloudflare 차단" 수준보다 훨씬 넓은 차단으로, 이번 주는 브랜드 사이트를 직접
열어 사이즈 차트나 실제 이미지 URL을 확인하는 것이 전면적으로 불가능했다.
대신 `WebSearch`(색인 스니펫 반환, 이 세션의 로컬 egress 정책을 타지 않음)로
브랜드별 실제 상품 페이지 URL과 제품 설명 문구를 확인하는 방식으로 대체함.

## 브랜드별 결과

| 브랜드 | 상태 | 캡처 수 | 실측(cm) 있음 | fit 설명만 | 비고 |
|---|---|---|---|---|---|
| Alo Yoga | WebSearch로 대체 캡처 | 5 (여2/남3) | 0 | 2 | 사이즈 차트 페이지 미열람 |
| Lululemon | WebSearch로 대체 캡처 | 5 (여2/남3) | 0 | 3 | `lululemon.co.kr` 대신 글로벌 도메인(`shop.lululemon.com`) 상품명 사용 — 지역 사이트 접근 불가 |
| Uniqlo | **차단, 0건** | 0 | 0 | 0 | `uniqlo.com` 계열 전체 egress 차단 확인, 지시대로 재시도 없이 0건 처리 |
| Vuori | WebSearch로 대체 캡처 | 5 (여3/남2) | 0 | 3 | 글로벌 사이트만 존재, 지역 도메인 이슈 없음 |
| On Running | WebSearch로 대체 캡처 | 5 (남2/여3) | 0 | 1 | `on.com/ko-kr` 대신 `on.com/en-us` 상품명 사용 — KR 도메인 접근 불가 |
| Aritzia (참고용) | WebSearch로 대체 캡처 | 5 (전부 여성) | 0 | 3 | `aritzia.com/intl/en` 대신 `aritzia.com/us/en` 사용, 경쟁사 아님 — 별도 파일 |

**실측(cm) 스펙이 있는 항목: 0건 / 전체 30건.** 사이즈 차트 페이지를 한 건도
열람하지 못했기 때문에, 이번 주 draft에는 숫자 스펙(`spec`)을 절대 채우지
않았음(하드 룰 준수 — 절대 임의 수치 생성 금지). `fitRaw`는 WebSearch 스니펫에
"relaxed fit", "boxy fit", "classic fit" 등 명시적 단어가 있을 때만 채웠고,
그 외에는 `null`로 남김. `dataType`은 스키마상 3개 값 중 하나를 반드시 채워야
해서 `"ai_estimate"`(가장 낮은 신뢰도 라벨)를 임시로 넣었으나, **실제로는 AI가
추정한 값이 아니라 "사이즈 차트를 열람하지 못해 수치 자체가 없음"을 뜻하므로
그대로 병합하지 말고 검토 시 재확인 필요.**

`sourceImageUrl`도 상품 상세 페이지를 열지 못해 실제 이미지 URL을 확인할 수
없었으므로 전부 `null`로 남김(추측/가공 금지). `sourceUrl`은 WebSearch가
반환한 실제 색인 URL이므로 신뢰 가능하나, Lululemon/On Running은 한국 도메인이
아닌 글로벌 도메인 URL임에 유의.

## 중요 — 프로덕션 데이터 반영 전 필수 확인사항

**`src/data/marketEntries.json`은 수작업으로 큐레이션된 프로덕션 데이터이며,
이 폴더의 draft 파일은 어디까지나 초안이다. 사람이 직접 리뷰하기 전에는 절대
숫자를 그대로 머지하지 말 것.** 과거 검수 없이 수치를 반영했다가 경쟁사
어깨너비(shoulder) 값이 3832cm로 오타가 나서 대시보드에 그대로 노출된 실제
버그 사례가 있었음 — 이번 주 draft는 그런 사고를 막기 위해 스펙을 비워둔
것이니, 다음 리서치 실행 시 사이트 접근이 복구되면 실제 사이즈 차트를 열어
직접 확인 후 채워 넣어야 한다.

## 다음 실행 시 확인할 것
- 이번 세션의 egress 차단이 일시적인지, 세션별 정책 설정 문제인지 관리자에게
  확인 필요(README 안내에 따라 "재시도·우회 금지, 관리자에게 보고"만 가능).
- 차단이 해소되면 Uniqlo(Akamai), Lululemon 상세페이지(Cloudflare) 등
  기존에 알려진 개별 차단 이슈만 남을 것으로 예상됨.
