# <img src="src/assets/logo_arok.webp" alt="" width="48" align="absmiddle" /> 에이록 - AI 기반 회의록 자동화 플랫폼 [![Live Demo](https://img.shields.io/badge/🔗_Live_Demo-arok--frontend.vercel.app-5B5FF5?style=flat-square)](https://arok-frontend.vercel.app/)

<div align="center">

<img src="docs/images/project_overview.webp" alt="Arok 서비스 개요" width="100%" />

<br/>
<br/>

![React](https://img.shields.io/badge/React_19-5B5FF5?style=for-the-badge&logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![GPT-4.1](https://img.shields.io/badge/GPT--4.1-412991?style=for-the-badge)
![Deepgram](https://img.shields.io/badge/Deepgram_Nova--3-13EF95?style=for-the-badge&logo=deepgram&logoColor=black)
![AssemblyAI](https://img.shields.io/badge/AssemblyAI-2545F6?style=for-the-badge)
![LiveKit](https://img.shields.io/badge/LiveKit-1FD5F9?style=for-the-badge&logo=livekit&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

</div>

<br/>

## 📌 프로젝트 소개

기존 음성인식 회의록 서비스는 대부분 **1인용 모바일·웹 앱** 중심으로 만들어져 있어, 특정 회의실에서 정기적으로 열리는 회의나 컨퍼런스처럼 **다자간·지속적인 회의**에는 활용도가 낮았습니다. 생성된 회의록도 실제 업무보다는 증빙 자료로만 남는 경우가 많아, 회의록보다 개인 메모가 더 유용해지는 아이러니한 상황이 반복됩니다.

Arok은 이 문제의식에서 출발해 ㈜넥타르소프트의 제안을 바탕으로 기획·개발한 **웹서비스 기반 AI 회의록 요약 시스템**입니다. Microsoft Work Trend Index(2023), Flowtrace State of Meetings Report(2025)에 따르면 팬데믹 이후 회의 시간은 약 3배 늘어 직장인이 연간 근무일의 약 1/5(약 49일)을 회의에 사용합니다. Arok은 이렇게 늘어난 회의 시간을 더 생산적으로 만드는 것을 목표로 합니다.

<br/>

## 🏗️ 시스템 아키텍처

<img src="docs/images/system_architecture.webp" alt="Arok 시스템 아키텍처 및 회의 모드별 처리 방식" width="100%" />

<br/>

## ⭐ 핵심 기능 — 3가지 회의 방식

<table>
<tr>
<td width="33%" valign="top">

### <img src="src/assets/icons/mic_icon.webp" alt="" width="32" align="absmiddle" /> 실시간 녹음

마이크를 통해 회의를 실시간으로 녹음하고 즉시 텍스트로 변환합니다. 회의가 진행되는 동안 대화 내용이 실시간으로 기록됩니다.

`실시간 전송` `화자 분리` `자동 저장`

<br/>
</td>
<td width="33%" valign="top">

### <img src="src/assets/icons/person_group_icon.webp" alt="" width="32" align="absmiddle" /> 온라인 그룹 회의

여러 참여자가 동시에 온라인으로 접속해 회의를 진행합니다. 방장이 종료하면 모든 참여자에게 회의록이 공유됩니다.

`여러명 참여` `역할 구분` `실시간 공유`

<br/>
</td>
<td width="33%" valign="top">

### <img src="src/assets/icons/upload_file_icon.webp" alt="" width="32" align="absmiddle" /> 녹음 파일 업로드

이미 녹음된 오디오 파일을 업로드하면 AI가 자동으로 분석해 화자를 분리하고 회의록을 생성합니다.

`MP3/WAV 지원` `화자 식별` `배치 처리`

<br/>
</td>
</tr>
</table>

<br/>

## 🚀 사용 흐름

```
  회의 방식 선택  ┄┄▶  회의 시작  ┄┄▶  AI 요약 생성  ┄┄▶  확인 및 공유
```

|  단계  | 내용           | 설명                                                                 |
| :----: | :------------- | :------------------------------------------------------------------- |
| **01** | 회의 방식 선택 | 실시간 녹음, 그룹 회의, 파일 업로드 중 원하는 방식을 선택합니다.     |
| **02** | 회의 시작      | AI가 실시간으로 음성을 텍스트로 변환하고 화자를 자동으로 구분합니다. |
| **03** | AI 요약 생성   | 회의 종료 후 주요 내용, 결정 사항, 후속 조치를 자동으로 정리합니다.  |
| **04** | 확인 및 공유   | 생성된 회의록을 검토하고 팀과 공유하거나 문서로 내보냅니다.          |

<br/>

## 💻 주요 화면

<table>
<tr>
<th width="50%" align="center">새 회의 시작</th>
<th width="50%" align="center">온라인 그룹 회의</th>
</tr>
<tr>
<td><img src="src/assets/images/new_meeting_screenshot.webp" alt="새 회의 시작 화면" width="100%" /></td>
<td><img src="src/assets/images/group_meeting_screenshot.webp" alt="온라인 그룹 회의 화면" width="100%" /></td>
</tr>
<tr>
<td valign="top">팝업으로 새 회의 시작 · 회의 유형 선택</td>
<td valign="top">회의 코드로 간편 참여, 발화 즉시 실시간 STT 자막 표시</td>
</tr>
</table>

<table>
<tr>
<th width="50%" align="center">실시간 녹음 회의</th>
<th width="50%" align="center">AI 회의록 상세 보기</th>
</tr>
<tr>
<td><img src="src/assets/images/live_meeting_screenshot.webp" alt="실시간 녹음 회의 화면" width="100%" /></td>
<td><img src="src/assets/images/meeting_detail_screenshot.webp" alt="회의록 상세 화면" width="100%" /></td>
</tr>
<tr>
<td valign="top">발화 즉시 화자별로 구분되어 자막으로 기록</td>
<td valign="top">AI 요약과 대화 전문 확인, 재요약 · 내보내기 · 화자 편집</td>
</tr>
</table>

<table>
<tr>
<th width="50%" align="center">회의록 관리 및 검색</th>
<th width="50%" align="center">회의 인사이트 분석</th>
</tr>
<tr>
<td><img src="src/assets/images/meeting_list_screenshot.webp" alt="회의록 목록 화면" width="100%" /></td>
<td><img src="src/assets/images/user_insight_screenshot.webp" alt="회의 인사이트 화면" width="100%" /></td>
</tr>
<tr>
<td valign="top">날짜 · 키워드 · 회의 유형별 검색과 목록 관리</td>
<td valign="top">키워드 · 발언 분포 · 기간별 통계 시각화</td>
</tr>
</table>

<br/>

## 🛠️ 기술 스택

| 구분         | 사용 기술                                                                    |
| :----------- | :--------------------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router 7, Motion |
| **Backend**  | Spring Boot                                                                  |
| **Database** | Supabase (PostgreSQL) — `meetings` 중심 7개 테이블 설계                      |
| **AI**       | Deepgram Nova-3(+diarizer), AssemblyAI, LangChain + gpt-4.1                  |
| **Realtime** | LiveKit Client, WebRTC, WebSocket STT                                        |
| **Deploy**   | Vercel (Frontend), Railway (Backend)                                         |
| **Design**   | Figma                                                                        |

<br/>

## 🔍 기술 선정 근거

**음성인식(STT)** — 실시간 스트리밍 가능 여부, 화자 분리 필요성, 비용을 기준으로 Deepgram, gpt-4o-transcribe, AssemblyAI를 비교했습니다. 정확도는 세 모델이 비슷했지만 지연시간과 비용에서 차이가 있어, **실시간 온·오프라인 회의에는 Deepgram Nova-3(+diarizer)**, **녹음 파일 업로드에는 AssemblyAI**를 각각 적용했습니다.

**요약(LLM)** — gpt-4.1, gpt-4.1-mini, claude-sonnet, claude-haiku를 속도·비용·품질 기준으로 비교했습니다. 요약 품질은 gpt-4.1과 claude-sonnet이 모두 우수했으나, 속도를 최우선 기준으로 두어 **gpt-4.1을 최종 채택**했습니다.

**실시간 자막 UX** — 문장이 확정(final)될 때까지 기다렸다가 자막을 표시하면 발화 중 화면이 비어 체감 지연이 컸습니다. STT의 **partial(중간) 결과를 발화 즉시 화면에 반영**하고 문장이 확정되면 최종 텍스트로 자연스럽게 교체하는 방식으로, 라이브 캡션에 가까운 실시간성을 확보했습니다.

<br/>

## 👥 팀 구성

| 이름   | 담당 업무                         | GitHub                                                               |
| :----- | :-------------------------------- | :------------------------------------------------------------------- |
| 배율희 | ERD 설계 및 DB 구현               | [@baeyulhee](https://github.com/baeyulhee)                           |
| 이승현 | LLM 서버 및 요약 관련 백엔드 처리 | [@sihumji00](https://github.com/sihumji00)                           |
| 정용진 | STT 처리 및 백엔드 처리           | [@Youngyoung1](https://github.com/Youngyoung1)                       |
| 양예영 | UI/UX 디자인 및 프론트엔드 구현   | [@hs-2171117-yeyoungyang](https://github.com/hs-2171117-yeyoungyang) |
