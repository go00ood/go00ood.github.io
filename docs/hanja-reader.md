# 한자 읽기

블로그의 Chirpy 페이지 레이아웃과 테마 색상·글꼴을 상속하는 도구입니다.
사이드바에 **한자 읽기**가 추가되고, 빌드 후 경로는 `/hanja-reader/`입니다.
서버 API 없이 정적 HTML/CSS/JavaScript로 동작하므로 기존 GitHub Pages 배포에 포함됩니다.

## 구성

- `_tabs/hanja-reader.html`: 메뉴, 페이지 설정, 리소스 로드
- `_includes/hanja-reader.html`: 입력·출력 UI
- `assets/hanja-reader/style.css`: 도구 내부에만 적용하는 스타일
- `assets/hanja-reader/app.js`: 한자별 팝업·네이버 링크
- `assets/hanja-reader/naver-ext.json`: 제공된 원본과 동일한 사전 자료
- `assets/hanja-reader/data.js`: `window.HANJA_DATA = ` + 원본 JSON + `;`

`assets/hanja-annotator.js`에는 `data-hanja-reader` 속성이 있는 영역을 건너뛰는
조건이 추가되어 있습니다. 기존 자동 독음 병기가 원문과 팝업을 다시 쓰지 않도록 합니다.

## 게시

이 변경 파일을 검토한 뒤 기존 방식대로 저장소에 커밋·푸시하면 됩니다.
현재 `.github/workflows/jekyll.yml`은 main 브랜치 푸시 시 Jekyll 빌드와 Pages 배포를 실행합니다.
배포가 성공하면 `https://go00ood.github.io/hanja-reader/`에서 열 수 있습니다.
로컬 파일 작업 자체로는 GitHub 게시가 이루어지지 않습니다.

## 자료 갱신

`naver-ext.json`을 바꾼 후 해당 자료 폴더에서 PowerShell로 보조 파일을 다시 생성합니다.

```powershell
$jsonText = [IO.File]::ReadAllText((Join-Path $PWD 'naver-ext.json'))
[IO.File]::WriteAllText((Join-Path $PWD 'data.js'), 'window.HANJA_DATA = ' + $jsonText + ';', [Text.UTF8Encoding]::new($false))
```

처음 열면 입력창은 비어 있습니다. 예문 넣기와 지우기 버튼을 사용할 수 있으며, 사전은 기본 자료를 사용합니다.
자료 출처: https://github.com/zispace/data-hanja/blob/main/data/naver-ext.json

자료에 없는 한자는 점선 링크로 표시하며, 클릭하면 `https://hanja.dict.naver.com/#/search?query=` 뒤에 해당 글자를 URL 인코딩하여 검색합니다. 자료에 있는 한자는 기존 entryId 상세 링크를 사용합니다.
