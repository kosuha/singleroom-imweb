
/**
 * 플로팅 서브 메뉴
 */
{
  /*
    섹션(구역) 이름과 해당 ID 매핑 설정
    
    [section_name]: [id]
    section_name은 앵커 href의 # 다음 부분과 일치해야 함(아래 예시의 #test).
      예시: https://www.singleroom.kr/esg-goods#test
    id는 임의로 지정 가능하나 다른 id와 겹치는 것을 방지하기 위해
    'singleroom-'과 같은 접두사를 붙이는 것을 권장함(예: singleroom-area-test).
    id는 반드시 고유해야 하며, section_name과 id는 1:1로 매핑되어야 함.
    id는 텍스트 위젯을 코드보기로 열어서 html 태그에 id로 직접 지정해야함.
    section_name과 id는 반드시 다르게 설정해야 함.
    id와 앵커가 동일할 경우 아임웹의 앵커 기능 때문에 원하는 대로 작동하지 않음.
    데이터 쌍 마지막에는 섹션의 끝을 알려주는 "end": "singleroom-area-end"를 넣는 것을 권장함.
  */
  const sectionIds = {
    "a": "singleroom-area-a",
    "b": "singleroom-area-b",
    "end": "singleroom-area-end"
  };

  /*
    서브메뉴의 위젯 아이디 설정

    아임웹에서 지정하는 위젯 ID가 필요함.
    개발자도구(F12)에서 확인할 수 있음.
  */
  const submenu = document.getElementById('w202509011599600243159');

  const submenuLinks = submenu.querySelectorAll('a');

  // 부드러운 스크롤 함수
  function smoothScrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      // 모든 부모의 offsetTop을 누적해서 정확한 위치 계산
      let elementTop = 0;
      let currentElement = element;
      while (currentElement) {
        elementTop += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
      }
      
      // 엘리먼트의 높이만큼 오프셋 추가
      const offset = 60;
      
      window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
    }
  }
  
  // 서브메뉴 클릭 이벤트 추가
  submenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // 기본 앵커 동작 방지
      
      const href = link.getAttribute('href');
      // href에서 # 이후 부분만 추출
      const hashIndex = href.indexOf('#');
      const targetName = hashIndex !== -1 ? href.substring(hashIndex + 1) : href.substring(1);
      const targetId = sectionIds[targetName];
      
      // 해당 엘리먼트로 스크롤만 수행
      smoothScrollToElement(targetId);
    });
  });
  
  // URL 해시 변경 감지 (뒤로가기/앞으로가기)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
      const targetName = hash.substring(1); // # 제거
      const targetId = sectionIds[targetName];
      if (targetId) {
        smoothScrollToElement(targetId);
      }
    }
  });
  
  // 현재 스크롤 위치에 따른 활성 메뉴 업데이트
  function updateActiveMenu() {
    const viewportTop = window.scrollY;
    
    // 모든 링크에서 active 클래스 제거
    submenuLinks.forEach(link => link.classList.remove('active'));
    
    // 각 섹션의 위치 정보를 수집
    const sectionPositions = [];
    
    Object.keys(sectionIds).forEach(key => {
      const sectionId = sectionIds[key];
      const element = document.getElementById(sectionId);
      
      if (element) {
        // 엘리먼트의 절대 위치 계산
        let elementTop = 0;
        let currentElement = element;
        while (currentElement) {
          elementTop += currentElement.offsetTop;
          currentElement = currentElement.offsetParent;
        }
        
        sectionPositions.push({
          key: key,
          top: elementTop,
          bottom: elementTop + element.offsetHeight
        });
      }
    });
    
    // 위치순으로 정렬
    sectionPositions.sort((a, b) => a.top - b.top);
    
    // 각 섹션의 실제 범위 계산 (다음 섹션 시작점까지)
    for (let i = 0; i < sectionPositions.length; i++) {
      const currentSection = sectionPositions[i];
      const nextSection = sectionPositions[i + 1];
      
      if (nextSection) {
        // 다음 섹션이 있으면 다음 섹션 시작점까지가 현재 섹션의 범위
        currentSection.bottom = nextSection.top;
      } else {
        // 마지막 섹션이면 페이지 끝까지 (또는 충분히 큰 값)
        currentSection.bottom = Math.max(
          currentSection.bottom, 
          document.documentElement.scrollHeight
        );
      }
    }
    
    // 현재 뷰포트에서 50% 이상 보이는 섹션 찾기
    const viewportHeight = window.innerHeight;
    const viewportBottom = viewportTop + viewportHeight;
    let activeSection = null;
    let maxVisibilityRatio = 0.5; // 최소 50% 이상이어야 함
    
    for (const section of sectionPositions) {
      const sectionTop = section.top;
      const sectionBottom = section.bottom;
      
      // 뷰포트와 섹션의 교집합 계산
      const intersectionTop = Math.max(viewportTop, sectionTop);
      const intersectionBottom = Math.min(viewportBottom, sectionBottom);
      const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
      
      // 뷰포트 기준 가시성 비율 계산 (섹션이 뷰포트의 몇 %를 차지하는지)
      const visibilityRatio = intersectionHeight / viewportHeight;
      
      // 뷰포트의 50% 이상을 차지하고, 가장 많이 차지하는 섹션을 활성화
      if (visibilityRatio > maxVisibilityRatio) {
        maxVisibilityRatio = visibilityRatio;
        activeSection = section.key;
      }
    }
    
    // 활성 섹션에 해당하는 링크에 active 클래스 추가 및 URL 업데이트
    if (activeSection) {
      const activeLink = Array.from(submenuLinks).find(link => {
        const href = link.getAttribute('href');
        // href에서 # 이후 부분만 추출해서 비교
        const hashIndex = href.indexOf('#');
        const targetName = hashIndex !== -1 ? href.substring(hashIndex + 1) : href.substring(1);
        return targetName === activeSection;
      });
      if (activeLink) {
        activeLink.classList.add('active');
        
        // 현재 URL 해시와 활성 섹션이 다르면 URL 업데이트
        const currentHash = window.location.hash.substring(1);
        if (currentHash !== activeSection) {
          // 페이지 새로고침 없이 URL 해시 업데이트
          history.replaceState(null, null, `#${activeSection}`);
        }
      }
    } else {
      // 활성 섹션이 없으면 URL에서 해시 제거
      if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
      }
    }
  }

  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', updateActiveMenu);

  // 페이지 로드 시 초기화
  window.addEventListener('load', () => {
    // 초기 활성 메뉴 설정
    
    // URL에 해시가 있으면 해당 섹션으로 스크롤
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const targetName = hash.substring(1); // # 제거
        const targetId = sectionIds[targetName];
        if (targetId) {
          smoothScrollToElement(targetId);
        }
      }, 100);
    }
    setTimeout(() => {
      updateActiveMenu();
    }, 500);
  });

}
