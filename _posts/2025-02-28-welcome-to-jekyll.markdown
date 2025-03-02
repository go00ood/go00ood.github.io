---
layout: post
title:  "[zotero] 조테로 7 사용법(zotero+Google Drive+Notion 연동)"
date:   2025-02-28 17:10:17 +0900
categories: zotero 
---

![조테로７](https://github.com/user-attachments/assets/1a2825f0-38fb-4641-a09e-0ae04710e9cc)



## 이 글에서 다루는 내용
1. zotero 기본 설정
2. Google Drive 연동 + zotfile 대체(attanger)
3. Notion 연동 
4. translators 
5. style 변환(논문 인용 양식 변환)
6. 도움이 되는 plugin 추천


### Zotero 사용 계기

- **노션과 연동 가능**  
- **파일명 관리+폴더 필요**  
- **인용관리 및 서지정보 저장 자동화**  
- **다양한 플러그인 사용 가능**  

> 특히 Notion 중독자이기 때문에 Zotero에서 노션과 연동이 가능하다는 것은 나에게 큰 동기가 되었다. 

++ 초기에는 서지정보 저장이 riss, dbpia 등에서 잘 안되었었는데 이는 나중에 개선을 할 수 있었다. 


---

### Zotero 이용 방식 
1. 논문 사이트에서 조테로 커넥터 연결 
2. 조테로에 서지 정보 저장 
3. 논문 다운로드 이후 파일을 서지 정보에 연결 
4. 구글 드라이브에 "저자(연도), 제목"으로 자동 저장 
5. 노션 데이터베이스에 내용 저장 

조테로는 2, 4, 5의 작업을 자동화할 수 있다.
따라서 인간은 구글에서 조테로 커넥터를 클릭하고(서지 정보를 조테로에 입력), 서지정보와 다운받은 파일을 연결해주면 된다. 


## 1. zotero 기본 설정

### 1.1. 다운로드 및 초기설정 

[https://m.blog.naver.com/charmsb/221631425423](https://m.blog.naver.com/charmsb/221631425423)

- 다운 및 초기 설정에 대한 친절한 글 

[https://blog.naver.com/shpowd/223599677542](https://blog.naver.com/shpowd/223599677542)

- 조테로 7에 해당하는 설치 방법 

---

추가적으로 zotero settings에서 이와 같은 설정으로 사용중이다. (Edit → Settings)
![zotero settings general](https://github.com/user-attachments/assets/6d348239-cc7e-4c48-8f6b-cccd951e982b)

### 1.2. Edit → Settings → general 설정내용

#### File Handling
☑ Automatically attach associated PDFs and other files when saving items

☑ Automatically retrieve metadata for PDFs and ebooks

☐ Automatically take snapshots when creating items from web pages
> 용량을 줄이기 위해 snapshot은 해제 

#### File Renaming
- 파일 이름을 서지정보에 따라 자동으로 바꿀 수 있다. 
- [Customize Filename Format...]를 클릭하여 선호하는 형식으로 바꿀 수 있음 
- **저자명(연도), 제목** 형식 (Filename Template에 입력하면 됨)

```python 
{{ firstCreator suffix="(" }}{{ year suffix="), " }}{{ title truncate="100" }}

```
ex) 김민국(2017), ‘에서’ 주어의 통사와 의미.pdf

---
##### File Renaming 관련 문서
[https://www.zotero.org/support/file_renaming](https://www.zotero.org/support/file_renaming)

**주요 변수**
- 예제를 참고하여 수정하면 된다. 

| **변수(Variable)** | **설명(Description)** |
|-----------------|------------------|
| **authors** | 부모 아이템의 주요 창작자(논문이면 저자, 예술 작품이면 아티스트 등). 편집자나 기타 기여자는 포함되지 않음. |
| **editors** | 부모 아이템의 편집자 정보. |
| **creators** | 부모 아이템의 모든 창작자(저자, 편집자 등 모두 포함). |
| **firstCreator** | 부모 아이템의 대표 저자 또는 편집자(1~2명). Zotero의 "Creator" 열 값과 동일. |
| **itemType** | 부모 아이템의 유형(예: 책, 논문, 보고서 등). Zotero에서 지원하는 모든 유형 목록은 [itemTypes](https://api.zotero.org/itemTypes)에서 확인 가능. |
| **attachmentTitle** | 첨부 파일(예: PDF, 이미지 등)의 제목. |
| **year** | 부모 아이템의 날짜 필드에서 추출한 연도. |
| **Any item field** | Zotero에서 제공하는 모든 필드를 변수로 사용할 수 있음. 전체 목록은 [Zotero 문서](https://www.zotero.org/support)에서 확인 가능. |






## 2. Google Drive 연동 + Attanger
### 2.1. Google Drive 연동
[https://zkfqkfkaskfkr.tistory.com/2](https://zkfqkfkaskfkr.tistory.com/2)
[https://blog.naver.com/lazykiss/222679311922](https://blog.naver.com/lazykiss/222679311922)

- 해당 블로그를 참고하면 가능 
- Google Drive이외에도 onedrive도 적용 가능


### 2.2. ZotFile 대체 - Attanger
- 앞선 글에서는 zotfile을 사용하는데 사실 zotero 7에서는 불가능하다. 
- 이와 유사한 기능을 하는 [attanger](https://github.com/MuiseDestiny/zotero-attanger)을 사용하면 간단하게 해결할 수 있음. 

---

- zotfile과 동일하게 attanger도 설치 
  - [zotero-attanger github](https://github.com/MuiseDestiny/zotero-attanger)
- 원리는 동일하다. 
  - 일정한 구글 드라이브 경로를 설정해주면, 그 폴더에 파일명을 바꿔 파일을 저장하는 방식. 
  - 파일 저장명 등은 수정할 수 있음 
  - 카테고리별로 subfolder 설정 여부를 선택할 수 있음 

---
Edit → Settings → Attanger
![Attanger 설정](https://github.com/user-attachments/assets/ee52fd3b-a421-4af4-8467-8c5510d3c3ec)

- 빨간색: 논문을 저장할 드라이브 경로(드라이브에 새로운 폴더를 만들어서 관리하는 것이 편함)
- 주황색: subfolder 및 파일명 관련 설정 

---

📌 Other Settings

☑ Shortcut for Attach New File: Ctrl + I
☑ Shortcut for Match Attachment: Ctrl + M
☑ Automatically rename added attachments
☑ Automatically move added attachments
☐ Automatically delete empty folders after moving


## 3. Notion 연동 - Notero
- 매우 소중한 플러그인이다. 
- 노션 데이터베이스에 자동으로 여러 정보들을 입력해줌.
- Zotero를 통해 Notion에 입력된 항목(예: 논문, 책 등)에 대해 새로운 내용을 추가하면(즉, 해당 페이지에 메모나 요약 등을 작성하면), 이후 Zotero에서 해당 항목의 서지 정보(제목, 저자, 연도 등)가 수정되더라도 Notion에 추가한 내용은 변경되지 않고 그대로 유지됨.
- 기존 데이터베이스에 조테로를 연결해도 작동됨
- 데이터베이스에 새로운 속성을 추가해도 상관 없음

- [Notero 공식문서](https://github.com/dvanoni/notero)

---

- https://blog.naver.com/cutegirl8856/223456667381
- https://m.blog.naver.com/550sn/223268847139
  - 설치 관련 글 
  
---

📌 주의해야할 점 

https://github.com/dvanoni/notero?tab=readme-ov-file#notion-database-properties

- 해당 내용에 따라서 알맞게 Property Name과	Property Type을 notion 데이터베이스에 설정해둬야 작동이 된다. 



## 4. translators 
- 조테로의 translators는 웹사이트에서 참고 문헌 정보를 자동으로 가져오기 위한 스크립트를 뜻함.
- 특정 사이트에서 서지정보가 제대로 저장이 안 될 때 보완 가능 
- tools > developer > translator editor 에서 확인 및 수정

---
- Google Scholar, Springer, ArXiv 등은 이미 코드가 작성되어 있으나... 한국 학술 사이트들은 잘 작동 안 될 때가 많음 

### 한국 학술 사이트에 대한 translators
- https://github.com/go00ood/zotero-translators-kr

- 여기서 KCI, DBpia, RISS, Scholar, eArticle, KISS와 같은 한국 학술 사이트에 대한 translators 다운 가능 


## 5. style 변환(논문 인용 양식 변환)
- Zotero 스타일(Styles) 은 참고 문헌(References) 및 인용(Citations)을 특정 형식으로 자동 변환해주는 기능
- Edit → Settings → Cite → Styles에서 확인 가능 
- Edit → Settings → Export → Item Format: 에서 기본적으로 활용할 인용 방식을 설정 가능. 


### 5.1. 조테로 스타일 검색 
 https://www.zotero.org/styles

### 5.2. 조테로 스타일 만들기 
https://editor.citationstyles.org/visualEditor/

- 얘로 만들기를 시도한 적이 있었다
- 챗지피티로 하면 잘 된다ㅎㅎ... 

### 5.3. 한국어학 참고문헌 style
- https://github.com/go00ood/zotero-style-korean


## 6. 도움이 되는 plugin 추천

### 6.1. Translate for Zotero
https://github.com/windingwind/zotero-pdf-translate#readme

![Translate for Zotero](https://velog.velcdn.com/images/go00od/post/5c296864-e12b-4a8e-aa2e-ed2fb952decb/image.png)
- 적당히 잘되므로 매우 행복하게 해줌. 
- 자동번역 


### 6.2. Better Notes for Zotero
https://github.com/windingwind/zotero-better-notes#readme


### 6.3. Actions and Tags for Zotero
https://github.com/windingwind/zotero-actions-tags#readme
- 이런 저런 자동화 
- 안읽은 문서 unread 태그 달아줌 

### 6.4. Ethereal Style
https://github.com/muisedestiny/zotero-style#readme

- 무슨 기능인지 잘 모르겠는데 많이들 쓰는듯.  

