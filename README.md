<h1 align="center"> Emerdy API Server</h1>

### API-SERVER

=======

# 프로젝트 개요

## Emerdy

EmerDy는 딥러닝과 음성 처리 기술을 활용하여, 긴급 상황에서 피해자가 스스로 도움을 요청하고 외부에서 상황을 인지할 수 있도록 돕는 시스템을 개발하고자 한다. 이 시스템은 범죄 행위로부터 피해가 우려되는 약자가 신속하게 자신의 상황을 전달하고 적절한 도움을 받을 수 있도록 지원한다. EmerDy는 실시간 위치 트래킹과 정확한 상황 정보를 통해 피해 우려 상황에서 약자가 신속하게 도움을 받을 수 있도록한다.

<img width="257" alt="image" src="https://github.com/gradupro/app-server/assets/19159759/95c941d2-cb5c-476f-ba53-c6971c9d4b43"> <br>

## 주요 기능

1. 핸드폰 번호를 통한 회원가입 및 로그인
2. 녹음 음성 처리
3. 위급 상황 분류
4. 실시간 위치 트래킹
5. 보호자에게 신고자의 위급 상황 Push 알림
   <img width="760" alt="그림1" src="https://github.com/gradupro/app-server/assets/19159759/81a02944-3d5d-48ea-9766-aa97e5f47803">

## Application Service Scenario

<img width="675" alt="image" src="https://github.com/gradupro/app-server/assets/19159759/f7a9ffbe-294a-4558-8da2-f5323fc46bdb"> <br>

## Application Service Process

<img width="675" alt="image" src="https://github.com/gradupro/app-server/assets/19159759/5fa6aa14-8494-4fab-909e-3df982d47e84"> <br>

# 프로젝트 아키텍쳐

## 기술 스택

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Typeform](https://img.shields.io/static/v1?style=for-the-badge&message=Typeform&color=262627&logo=Typeform&logoColor=FFFFFF&label=)

![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

![Naver](https://img.shields.io/static/v1?style=for-the-badge&message=Naver&color=222222&logo=Naver&logoColor=03C75A&label=)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon EC2](https://img.shields.io/static/v1?style=for-the-badge&message=Amazon+EC2&color=222222&logo=Amazon+EC2&logoColor=FF9900&label=)
![Amazon ECS](https://img.shields.io/static/v1?style=for-the-badge&message=Amazon+ECS&color=222222&logo=Amazon+ECS&logoColor=FF9900&label=)
![Amazon RDS](https://img.shields.io/static/v1?style=for-the-badge&message=Amazon+RDS&color=527FFF&logo=Amazon+RDS&logoColor=FFFFFF&label=)
![Amazon S3](https://img.shields.io/static/v1?style=for-the-badge&message=Amazon+S3&color=569A31&logo=Amazon+S3&logoColor=FFFFFF&label=)

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![PM2](https://img.shields.io/static/v1?style=for-the-badge&message=PM2&color=2B037A&logo=PM2&logoColor=FFFFFF&label=)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![FFmpeg](https://img.shields.io/static/v1?style=for-the-badge&message=FFmpeg&color=007808&logo=FFmpeg&logoColor=FFFFFF&label=)

## System Architecture

<img width="760" alt="image" src="https://github.com/gradupro/app-server/assets/19159759/cce86e3a-e798-40dd-8cba-63783b7bf154">

## 기능별 상세 프로세스

### 오디오 데이터 분할

![그림1](https://github.com/gradupro/app-server/assets/19159759/108f99ca-d5b8-4b32-8e7d-c84db47cdbca)

### STT – AWS Transcribe 연결

![그림1](https://github.com/gradupro/app-server/assets/19159759/10f80c6c-ba2d-4567-90ab-4f64203b6108)

### 분리 오디오별 위급 상황 분류

![그림1](https://github.com/gradupro/app-server/assets/19159759/0f861f18-0fad-4c42-88cb-e85e60c00681)

### Message Queue를 통한 푸시 알림

![그림1](https://github.com/gradupro/app-server/assets/19159759/d2f8a7e8-cea3-4063-a447-11461f81ea32)

### Socket.io - 실시간 경로 데이터 전송

![그림1](https://github.com/gradupro/app-server/assets/19159759/d08fd2d3-fe72-41d9-bc8a-5235bb27da0f)

### 이동 경로 업데이트

![그림1](https://github.com/gradupro/app-server/assets/19159759/8ec846c9-063e-49ed-9efb-e5322dc4a20a)

# 프로젝트 설계

## 데이터베이스 설계

![그림1](https://github.com/gradupro/app-server/assets/19159759/0b9e67db-b141-4e3e-afe4-a5732c988538)

## API 설계 ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

[Emerdy API Document](https://documenter.getpostman.com/view/26092599/2s93RRwYe6#a797c456-c2b0-4fe5-a680-2abc17f7b577)

## CI/CD

![image](https://github.com/gradupro/app-server/assets/19159759/51ca5493-0ffd-4869-8c50-707620e5f517)

## 프로젝트 결과물

![그림1](https://github.com/gradupro/app-server/assets/19159759/2a37aad4-1b02-4ac6-8ff6-211c4f5bd966)

## 향후 개선사항

### STT 서비스 동기 로직 수정
