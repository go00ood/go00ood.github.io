---
layout: post
title:  "[Hugging Face] Hugging Face Model & Spaces 관련... /Pytorch Hugging Face 올리기 / repo.git_push() 오류"
description: Hugging Face Model & Spaces 관련... /Pytorch Hugging Face 올리기 / repo.git_push() 오류
date:   2025-03-04 
categories: 프로그래밍 HuggingFace 

---

무수한 오류를 반복하지 않기 위해 
== hugging face Space 사용하고 싶슴 ^^  

뭔가 있어보이게 hugging face Space에 내 것을 올리고 싶었음 -- 다만문제
1. 한번도 허깅페이스 안써봄 
2. 나는 파이토치로 된 모델임... ㅠ


# 1. hugging face에 모델을 올리려면?
- model에 들어가서 만들기 -- 라이선스랑 공개 여부 모델 이름 정도 설정하자
- 모델이 있어야 함 (예전에 저장해둔 것... -- 그냥 연습용 RNN공부로 한 것이라 .pt로 된 파일)
- 모델 카드 필요 (근데 그냥 비공개로 해놓고 생략함)

> 나는 뭔지 잘 모르겠기 때문에 
cc-by-nc-4.0 (Creative Commons Attribution-NonCommercial 4.0):
비상업적인 용도로만 사용할 수 있도록 제한하는 라이선스입니다. 비공개로 진행하고, 상업적 사용을 막고 싶다면 이 옵션을 선택할 수 있습니다.
=> 이걸 택했음 


# ~~2. hugging face에 올리는 과정 == git 이용과 유사~~ (실패 모음-3이 성공) 
- 개념은 비슷한데 뭔지 모르게 코드가 안통했음 
- 다만 추후 관리할 때는 필요한 생각일듯 


전반적으로 로컬에서 git을 이용할 때랑 매우 유사한 느낌 -- add하고 push하면 됨 . -- 그리고 chat gpt왈 git 명령어로도 가능하다고 말햇었음 그래서 시도한 것 

## <1차시도>
=> Repository 활용하기 == 결과적으로 안됨;;; 뭐가 문젠지 아직도 몰름

```python
pip install huggingface_hub
```


```python 
huggingface-cli login
```

- 로그인 하는 과정 -- 저기서 토큰을 입력하라고 알아서 링크를 준다
- 그대로 하면 토큰 받으면 아무튼 됨 ^^

```python
from huggingface_hub import Repository

repo = Repository(local_dir="C:/Users/Username/MyModels/", clone_from="myusername/korean-gender-predictor")
repo.push_to_hub(commit_message="Initial commit")

```
- 내 파일을 깃헙처럼 푸시해서 저기다 올리는 것.... 근데 ...문제 == 그냥 안됐음 ㅅ... 새로운 폴더만 생성되고 아무 일도 일어나지 않음

- local_dir="C:/Users/Username/MyModels/"
  - 로컬 디렉토리 경로
  - 설명: local_dir은 로컬 컴퓨터에서 모델을 저장하거나 작업할 디렉토리의 경로를 지정합니다. 이 디렉토리는 Git 리포지토리로 동작하며, 여기서 모델 파일을 추가하거나 수정할 수 있습니다.
  - 예시: 만약 로컬 컴퓨터의 C:\Users\Username\MyModels\ 폴더를 사용할 계획이라면, 아래와 같이 설정합니다.
- local_dir="C:/Users/Username/MyModels/"
  - clone_from: Hugging Face 리포지토리 경로
  - 설명: clone_from은 Hugging Face Hub에서 클론할 리포지토리의 경로를 지정합니다. 이 경로는 Hugging Face에서 생성한 모델 저장소의 경로를 의미합니다.
  - 예시: 만약 Hugging Face 사용자명이 myusername이고, 리포지토리 이름이 korean-gender-predictor라면, 아래와 같이 설정합니다.
  - clone_from="myusername/korean-gender-predictor"
  
```python 
repo.git_add()
repo.git_commit("Add RNN model")
repo.git_push()

```
이걸 하라고 시켰는데 얘도 안됨

## => 발생한 오류들... (아래 해결 방법 나옴)

```
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
``` 
```
OSError: remote: Invalid username or password.
fatal: Authentication failed for 'https://huggingface.co/go00od/korean-gender-predictor/' 
```

이 오류는 개소름돋는게 로그인을 백번 해도 로그인은 되었으나 아무튼 안됐음 ... ㅎ

```
remote: Invalid username or password.
fatal: Authentication failed for 'https://huggingface.co/go00od/korean-gender-predictor/'

WARNING:huggingface_hub.repository:remote: Invalid username or password.
fatal: Authentication failed for 'https://huggingface.co/go00od/korean-gender-predictor/'

```

+++ 마찬가지



깃 명령어를 써서 해보라고 함 == 안됨 (아래 애들은 왠지 모르게 안됐던 애들)

```
!git status

```
	!git push origin main

	!git init

```
!rm -rf .git
!git init
!git remote add origin https://huggingface.co/your-username/your-repository
!git pull origin main

```

코랩으로 하면 원래 안되는 것이든 무슨 이유인지는 모르겠지만 그냥 안됐음... 


# 3.upload_file 이용
- 이게 답이다.....
> 짚..왈... 
HTTP 기반 방법으로 전환 고려:
Repository 클래스 대신 HTTP 기반의 업로드 방법을 사용하는 것을 고려하세요. 이는 앞으로 Hugging Face에서 권장하는 방식입니다.

예를 들어, 모델을 업로드할 때 huggingface_hub의 upload_file 또는 upload_folder 함수 같은 HTTP 기반 메서드를 사용할 수 있습니다.

```python
from huggingface_hub import upload_file

upload_file(
    path_or_fileobj="path/to/your/model.pt", # 
    path_in_repo="model.pt",
    repo_id="go00od/korean-gender-predictor",
    token="your_access_token",
    repo_type="space"
)

```
> 이 메시지는 코드의 미래 호환성을 보장하기 위해 중요한 내용이므로, 권장하는 방법으로 전환하는 것이 좋습니다. 하지만, 당장에는 Repository 클래스를 계속 사용할 수 있으며, 최신 변경 사항을 가져온 후 작업을 계속할 수 있습니다.


- 매우 매우 매우 잘 된다....!!!
- path_or_fileobj: 지금 저장할 파일의 위치...및 이름... 
- path_in_repo: 내 파일 이름을 어떻게 해서 저장할 것인지... 
- repo_id: 내가 파일을 넣을 장소 == 주소로 넣으면 된다 (미리 그래서 허깅페이스에서 뉴 모델이나 뉴 스페이스를 하고,,, 그 이름을 넣어주면 됨) 
- token: 앞서서 받은 토큰... 허깅페이스 토큰 치면 잘 나온다... 
- repo_type: space나 model이나 내가 넣을 곳에 넣어주면 된다!!!! 


### Hugging Face API 토큰 얻는 방법: 
>짚 긁긁 

>Hugging Face에서 API 토큰을 얻으려면 다음 단계를 따르면 됩니다. 이 토큰은 API를 사용해 모델 또는 Space에 파일을 업로드하거나, 다양한 API 기능을 사용할 때 필요합니다.


1. **Hugging Face 계정에 로그인**:
   - 먼저 [Hugging Face 웹사이트](https://huggingface.co/)에 로그인합니다. 계정이 없다면, 계정을 생성해야 합니다.

2. **프로필 메뉴에서 토큰 접근**:
   - 로그인 후, 페이지 오른쪽 상단에 있는 프로필 아이콘을 클릭합니다.
   - 드롭다운 메뉴에서 "Settings"를 선택합니다.

3. **Access Tokens**:
   - 설정 페이지의 왼쪽 메뉴에서 "Access Tokens" 섹션을 선택합니다.
   - 여기서 "New Token" 버튼을 클릭하여 새로운 토큰을 생성할 수 있습니다.

4. **토큰 생성**:
   - 토큰의 이름과 권한 수준을 설정할 수 있습니다.
     - **Read**: 모델 및 Space를 읽을 수 있는 권한.
     - **Write**: 모델 및 Space에 쓰기/업로드할 수 있는 권한.
     - **Admin**: 관리 권한.
   - 일반적으로 업로드 작업을 위해서는 "Write" 권한이 필요합니다.
   - 설정 후 "Generate" 버튼을 클릭하면, 새로운 토큰이 생성됩니다.

5. **토큰 복사**:
   - 생성된 토큰을 복사해 둡니다. 이 토큰은 이후 스크립트에서 API 호출 시 사용됩니다.
   - **Note**: 이 토큰은 일회성으로 표시되므로, 생성 시 복사해 두는 것이 중요합니다. 만약 잃어버리면, 새로 생성해야 합니다.

