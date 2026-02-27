# 서비스 개요
TourLive의 투어 가이드는 여러개의 트랙으로 구성 되어 있다.
해당 트랙들을 그룹으로 묶어서 목록을 제공한다. 
또한 해당 트랙들을 지도에 매핑해서, 사용자가 지도에서 트랙을 선택하면 해당 트랙의 정보를 볼 수 있도록 한다.
 > 이는 사용자가 지도를 통해서 자신의 위치를 확인함과 동시에 내가 들을 수 있는 트랙들을 선택 할 수 있도록 한다. 
## 서비스 목표
현재 서비스에 그룹 및 지도 데이터를 입력 하려면 query를 통해서 개발자가 직접 입력 하고 있다. 
이를 개선하여 UX 도구를 통해서 주어진 트랙들을 그룹화 하며, 지도에 매핑하는 작업을 쉽게 수행 할 수 있도록 한다.

## 서비스 기능
투어 조회를 통해서 내가 원하는 투어를 선택 할 수 있다. 
1. 선택 된 투어의 트랙 정보를 조회 해서, 해당 트랙들을 그룹핑 할 수 있도록 한다.
   - Group 정보는 parent - child 구조를 가진다. 
   - 최상위 계층의 그룹은 parentId가 null이다. 
   - 하위 그룹들은 parent를 통해서 연결 된다. 
   - TourGroup, TourGroupTracks, 
     > TourGroup은 그룹 이름, 그룹 설명을 가진다. (parent를 통해서 상위 그룹과 연결)
     > TourGroupTracks는 그룹에 속한 트랙들을 매핑한다. 


2. 선택 된 투어에 지도 정보를 추가 한다. 
   - 지도는 Google Map과 SVG 기반 Image 지도를 지원 한다.
   - TourMap, TourMapPoints, TourMapPointTracks, TourMapPointToMap
     > TourMap은 지도 이름, 지도 타입(Google Map, SVG Image), 지도 이미지 URL을 가진다.
     > TourMapPoints는 지도 위에 표시 될 점들의 정보를 가진다. 
     > TourMapPointTracks는 점들에서 들을 수 있는 투어의 트랙을 매핑한다.
     > TourMapPointToMap은 점과 하위 지도를 매핑 한다.
       > 지도는 다른 지도를 연결 할 수 있다. 
       > 예를 들어서 Google맵에서 특정 point를 선택 하면, 해당 point에 위치한 건물 내부 SVG 지도를 사용할 수 있다. 

## 프로젝트 환경 구성

- nextjs 로 개발 하고, vercel 에 배포 한다. 
- typescript 를 사용 한다. 
- backend는 현재 tourlive의 stage 환경을 사용한다. 
  - Base domain : https://stage-api.tourlive.co.kr
  - backend 연결 인증은 'kyle_***********************' token 을 사용해서 bearer token 으로 통신 한다. 

## Backend API

- antigravity/tourlive-api 프로젝트의 docs 폴더를 참조해서 tour group, tour map 관련 작업 내용을 참조해줘
- tour track 조회
  > v4/tours/{tourId}/tour_tracks
- tour group 조회
  > v4/tours/{tourId}/tour_groups
- tour map 조회
  > v1/tour_maps?tour_id={tourId}
  > v4/tours/{tourId}/tour_maps** 관련 API들 참조  


## UI
특정 tour_id가 주어 졌을 때, 해당 투어의 track들을 조회 해서 해당 트랙 id, 이름을 목록으로 제공 한다. 
- 트랙들에 포함된 index필드를 참조해서 순서대로 제공 .

- 그룹 관리
  > 트랙을 그루핑 하기 쉬운 UI를 제공 해야 한다. 
  > 생성 혹은 수정된 그룹 정보 업데이트 
- 지도 관리 UI
  > 지도에 트랙을 매핑 하기 쉬운 UI를 제공 해야 한다. 
  > **변경 사항**: 구글 맵(Google Map)의 경우 API 사용 비용 및 키 발급 문제를 피하기 위해 실제 지도를 렌더링하지 않고, 위경도 좌표를 텍스트로 직접 입력 및 수정할 수 있는 **스프레드시트 뷰(데이터 그리드)** 형태로 제공한다.
  > 지도 좌표
    > google map의 경우 latitude, longitude 를 사용 한다. 
    > svg map의 경우 anchor_x, anchor_y, 을 사용한다. 
      > anchor_x, anchor_y는 svg 이미지의 좌측 상단을 (0.0,0.0)으로, 우측 하단을 (1.0,1.0)으로 했을 때의 좌표이다. 
