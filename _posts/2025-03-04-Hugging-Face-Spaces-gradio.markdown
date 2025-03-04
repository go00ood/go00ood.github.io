---
categories: 프로그래밍 HuggingFace
date: 2025-03-04
description: null
image:
  alt: gradio
  lqip: data:image/webp;base64,UklGRtQAAABXRUJQVlA4IMgAAACwBQCdASoyAC0APtFmqlEoJSOioqoxABoJaWnGNToRtgdoAALp6XZqb50/f820scGn00Z7QgAA/vE0pUaiULIXVc+d/LLNkSxz9s4X/k5tyeVaQ1aETnB1hIClyury5/QEVS6Q44pmvHU3mKvyFvFSbH5WkYyV0dyTCAdJ0sqtRhZvP7z5Z9nayTZArmQzKv7tM9cNdL3ZsbsKiOtRYzZF/gCVTDANj7ivYwn/RfRckCJlyRYL87baPfGMoFEM0evSXDbX0AAAAA==
  path: /assets/img/post/2025-03-04-Hugging-Face-Spaces-gradio.webp
layout: post
title: '[Hugging Face] Hugging Face Spaces 사용과 gradio'
---
- 매우 간단하다 
- 올리는 파일 형식만 맞으면 잘 된다 
- pytorch를 저장한 .pt 파일도 정상적으로 작동된다... 

<br>

## 1. space 내부 파일 형식 
```python 
#필수 
app.py
requirements.txt

#필요시 추가
model_def.py
모델
```

- app.py: 실행을 위해 필요한 요소를 담은 것으로, gradio 시작하는 코드, 모델 불러오는 코드, 각종 설정 등등이 포함됨 
- requirements.txt: 해당 코드를 실행하는데 필요한 요소들, 버전 등등도 포함될 수 있음 

- 이외에도 필자는 모델을 직접 올리는 방식을 택했기 때문에 직접 모델을 올려줌 (.pt 파일...)
- model_def.py: 기본적인 모델들 형식 정의... 


<br>

## 2. app.py 구성 
- 모델 로드 파트 
- 실행을 위한 예측 수행 함수 
- gradio 수행을 위한 부분 


<br>

## 3. gradio사용법 
- 매우 간단함 
### 기본 구조 
- gr.Interface 구축 - 기본적으로 인풋 아웃풋 형식 설정과 작동할 함수 필요함 
- demo.launch() 실행 

```python
demo = gr.Interface(
    fn=name_classifier, 
    inputs="text", 
    outputs="label"
)
```
- fn: 실행할 함수 -- 앞선 실행을 위한 예측 수행 함수... 등이 들어갈 수 있다. app.py파일 내부에 정의한 함수 명을 그냥 지정해주면 됨  
- inputs: 입력 형식 
- outputs: 아웃풋 형식 
---

### 제목과 설명, 예제를 포함하고 싶은 경우 
```python 
demo = gr.Interface(
    fn=name_classifier, 
    inputs="text", 
    outputs="label",
    title="한국이름 성별 예측 모델",  
    description="이 모델은 입력된 이름을 기반으로 성별을 예측합니다. 성을 제외한 이름을 입력하고 예측된 성별과 그 확률을 확인하세요.",  
    examples=[["하은"], ["현배"], ["혜윤"]] 
)

```
<br>
<br>
# 훌륭한 분들의 설명... 
https://lifeignite.tistory.com/63

https://yunwoong.tistory.com/228
> 이건 좀 다르긴 하지만... 적당히 이해 된다 


<br><br>
# 말 안듣고 requirements.txt 안 설정하면 발생하는 일... 
```
runtime error
Exit code: 1. Reason: Traceback (most recent call last):
  File "/home/user/app/app.py", line 2, in <module>
    import torch
ModuleNotFoundError: No module named 'torch'
Container logs:

===== Application Startup at 2024-08-11 05:37:46 =====

Traceback (most recent call last):
  File "/home/user/app/app.py", line 2, in <module>
    import torch
ModuleNotFoundError: No module named 'torch'
Traceback (most recent call last):
  File "/home/user/app/app.py", line 2, in <module>
    import torch
ModuleNotFoundError: No module named 'torch'
```

- Hugging Face Space의 실행환경에 `torch`(PyTorch)가 설치되어 있지 않아 발생.

- Space에서 필요한 패키지들을 설치하도록 해야 함 


### 해결 방법:

1. **`requirements.txt` 파일 추가**:
   - Space의 루트 디렉토리에 `requirements.txt` 파일을 추가하고, 해당 파일에 필요한 패키지들을 나열
   - PyTorch와 함께 필요한 패키지들을 `requirements.txt`에 추가

     ```text
     torch
     transformers
     gradio
     ```

   - 이 파일을 Space 리포지토리에 업로드하면, Space가 실행될 때 자동으로 이 파일을 읽고 필요한 패키지들을 설치함

2. **`requirements.txt` 생성 및 업로드**:
   - 로컬 환경에서 `requirements.txt` 파일을 생성하고, 이를 Space에 업로드할 수 있음 
   - 업로드된 `requirements.txt` 파일은 Space가 처음 실행될 때 패키지들을 설치하는 데 사용됨 

3. **`Dockerfile` 사용 (고급)**:
   - Hugging Face Space는 `Dockerfile`을 사용하여 환경을 커스터마이징할 수 있음 
   - 이 방법은 Space에서의 기본적인 환경 설정을 넘어서는 경우에 사용함
   - `torch` 설치를 포함한 `Dockerfile`을 작성할 수 있음:

     ```Dockerfile
     FROM huggingface/transformers-pytorch-cpu

     RUN pip install torch transformers gradio

     COPY app.py /app/app.py
     CMD ["python", "/app/app.py"]
     ```

   - 이 파일을 Space의 루트 디렉토리에 업로드하면, Space는 `Dockerfile`을 사용해 환경설정 가능