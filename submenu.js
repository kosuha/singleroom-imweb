
/**
 * 플로팅 서브 메뉴
 */
{
  /*
    섹션 이름과 해당 ID 매핑 설정
    
    [section_name]: [id]
    section_name은 앵커 href의 # 다음 부분과 일치해야 함(아래 예시의 #test).
      예시: https://www.singleroom.kr/esg-goods#test
    id는 임의로 지정 가능하나 다른 id와 겹치는 것을 방지하기 위해
    'singleroom-'과 같은 접두사를 붙이는 것을 권장함(예: singleroom-area-test).
    id는 반드시 고유해야 하며, section_name과 id는 1:1로 매핑되어야 함.
    id는 텍스트 위젯을 코드보기로 열어서 html 태그에 id로 직접 지정해야함.
    section_name과 id는 반드시 다르게 설정해야 함.
    id와 앵커가 동일할 경우 아임웹의 앵커 기능 때문에 원하는 대로 작동하지 않음.
  */
  const sectionIds = {
    "a": "singleroom-area-a",
    "b": "singleroom-area-b"
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
      const targetName = href.substring(1); // # 제거
      const targetId = sectionIds[targetName];

      // URL 업데이트 (페이지 새로고침 없이)
      history.pushState(null, null, href);
      
      // 해당 엘리먼트로 스크롤
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
    
    // 각 섹션의 영향 범위 계산 (비례적 할당)
    const sectionRanges = [];
    
    for (let i = 0; i < sectionPositions.length; i++) {
      const currentSection = sectionPositions[i];
      const prevSection = sectionPositions[i - 1];
      const nextSection = sectionPositions[i + 1];
      
      let rangeStart, rangeEnd;
      
      if (i === 0) {
        // 첫 번째 섹션: 시작부터 다음 섹션과의 중점까지
        rangeStart = 0;
        if (nextSection) {
          const gapStart = currentSection.bottom;
          const gapEnd = nextSection.top;
          const gapMidPoint = gapStart + (gapEnd - gapStart) / 2;
          rangeEnd = gapMidPoint;
        } else {
          // 섹션이 하나뿐인 경우
          rangeEnd = Infinity;
        }
      } else if (i === sectionPositions.length - 1) {
        // 마지막 섹션: 이전 섹션과의 중점부터 끝까지
        const gapStart = prevSection.bottom;
        const gapEnd = currentSection.top;
        const gapMidPoint = gapStart + (gapEnd - gapStart) / 2;
        rangeStart = gapMidPoint;
        rangeEnd = Infinity;
      } else {
        // 중간 섹션: 이전 섹션과의 중점부터 다음 섹션과의 중점까지
        const prevGapStart = prevSection.bottom;
        const prevGapEnd = currentSection.top;
        const prevGapMidPoint = prevGapStart + (prevGapEnd - prevGapStart) / 2;
        
        const nextGapStart = currentSection.bottom;
        const nextGapEnd = nextSection.top;
        const nextGapMidPoint = nextGapStart + (nextGapEnd - nextGapStart) / 2;
        
        rangeStart = prevGapMidPoint;
        rangeEnd = nextGapMidPoint;
      }
      
      sectionRanges.push({
        key: currentSection.key,
        start: rangeStart,
        end: rangeEnd
      });
    }
    
    // 현재 뷰포트 위치에 해당하는 섹션 찾기
    let activeSection = null;
    
    for (const range of sectionRanges) {
      if (viewportTop >= range.start && viewportTop < range.end) {
        activeSection = range.key;
        break;
      }
    }
    
    // 활성 섹션에 해당하는 링크에 active 클래스 추가
    if (activeSection) {
      const activeLink = Array.from(submenuLinks).find(link => 
        link.getAttribute('href') === `#${activeSection}`
      );
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }

  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', updateActiveMenu);

  // 페이지 로드 시 초기화
  window.addEventListener('load', () => {
    // 초기 활성 메뉴 설정
    updateActiveMenu();
    
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
  });

}
