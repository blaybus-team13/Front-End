let elders = [
    {
      elid: 1,
      center: "강동구 재가노인복지센터",
      elderly: {
        name: "김하은",
        birthYear: 1945,
        gender: "여",
        careLevel: "3등급",
        weight: 55,
        diseases: "고혈압, 당뇨",
        dementiaSymptoms: "약간의 기억력 저하",
        cohabitant: "배우자와 함께 거주",
        workplaceDetails: "아파트 3층, 엘리베이터 있음",
        additionalServices: "병원 동행 필요",
        location: "서울시 강동구 천호동",
        description: "가족들과 함께 거주하시며, 모두 친절하십니다!",
      },
      mealSupport: true,
      toiletSupport: false,
      mobilitySupport: true,
      hasJobPosting: true, // 채용공고 있음
      conditions: {
        wage: 13000,
        days: ["월요일", "수요일", "금요일"],
        time: "16~22시",
      },
      forced: false, // 기본적으로는 근무 조건과 일치하는 제안
    },
    {
      elid: 2,
      center: "강동구 재가노인복지센터",
      elderly: {
        name: "최지한",
        birthYear: 1945,
        gender: "여",
        careLevel: "3등급",
        weight: 55,
        diseases: "고혈압, 당뇨",
        dementiaSymptoms: "약간의 기억력 저하",
        cohabitant: "배우자와 함께 거주",
        workplaceDetails: "아파트 3층, 엘리베이터 있음",
        additionalServices: "병원 동행 필요",
        location: "서울시 강동구 천호동",
        description: "가족들과 함께 거주하시며, 모두 친절하십니다!",
      },
      mealSupport: true,
      toiletSupport: false,
      mobilitySupport: true,
      hasJobPosting: true, // 채용공고 있음
      conditions: {
        wage: 13000,
        days: ["월요일", "수요일", "금요일"],
        time: "16~22시",
      },
      forced: false, // 기본적으로는 근무 조건과 일치하는 제안
    },
    {
        elid: 3,
        center: "강동구 재가노인복지센터",
        elderly: {
            name: "최지한",
            birthYear: 1945,
            gender: "여",
            careLevel: "3등급",
            weight: 55,
            diseases: "고혈압, 당뇨",
            dementiaSymptoms: "약간의 기억력 저하",
            cohabitant: "배우자와 함께 거주",
            workplaceDetails: "아파트 3층, 엘리베이터 있음",
            additionalServices: "병원 동행 필요",
            location: "서울시 강동구 천호동",
            description: "가족들과 함께 거주하시며, 모두 친절하십니다!",
        },
        mealSupport: true,
        toiletSupport: false,
        mobilitySupport: true,
        hasJobPosting: false, // 채용공고 있음
        conditions: {
            wage: 0,
            days: [],
            time: "",
          },
        forced: false, // 기본적으로는 근무 조건과 일치하는 제안
      },
      {
        elid: 4,
        center: "강동구 재가노인복지센터",
        elderly: {
            name: "사람3",
            birthYear: 1945,
            gender: "여",
            careLevel: "3등급",
            weight: 55,
            diseases: "고혈압, 당뇨",
            dementiaSymptoms: "약간의 기억력 저하",
            cohabitant: "배우자와 함께 거주",
            workplaceDetails: "아파트 3층, 엘리베이터 있음",
            additionalServices: "병원 동행 필요",
            location: "서울시 강동구 천호동",
            description: "가족들과 함께 거주하시며, 모두 친절하십니다!",
        },
        mealSupport: true,
        toiletSupport: false,
        mobilitySupport: true,
        hasJobPosting: true, // 채용공고 있음
        conditions: {
          wage: 13000,
          days: ["월요일", "수요일", "금요일"],
          time: "16~22시",
        },
        forced: false, // 기본적으로는 근무 조건과 일치하는 제안
      },
  ];
  
  /** 어르신 목록 가져오기 */
export async function GET(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const jobPostingOnly = searchParams.get("jobPostingOnly") === "true"; // `true`이면 채용공고 등록된 어르신만 가져옴
  
    // 모든 어르신의 `conditions` 필드를 보장
    const filteredElders = elders
      .filter((elder) => !jobPostingOnly || elder.hasJobPosting)
      .map((elder) => ({
        ...elder,
        conditions: elder.conditions ?? { wage: 0, days: [], time: "" }, // 기본값 추가
      }));
  
    return new Response(JSON.stringify({ elders: filteredElders, hasElders: filteredElders.length > 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  
  /** 새로운 어르신 추가 */
  export async function POST(req: Request): Promise<Response> {
    try {
      const newElder = await req.json();
      newElder.id = elders.length + 1;
      newElder.hasJobPosting = false;
      newElder.forced = true;
      elders.push(newElder);
  
      return new Response(JSON.stringify({ success: true, elder: newElder, hasElders: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: "어르신 추가 실패", error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
  /** 어르신 정보 업데이트 */
  export async function PATCH(req: Request): Promise<Response> {
    try {
      const { id, updates } = await req.json();
      const elderIndex = elders.findIndex((e) => e.elid === id);
  
      if (elderIndex === -1) {
        return new Response(JSON.stringify({ success: false, message: "어르신을 찾을 수 없음" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      elders[elderIndex] = { ...elders[elderIndex], ...updates };
  
      return new Response(JSON.stringify({ success: true, elder: elders[elderIndex] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: "업데이트 실패", error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
  /** 어르신 삭제 */
  export async function DELETE(req: Request): Promise<Response> {
    try {
      const { id } = await req.json();
      elders = elders.filter((e) => e.elid !== id);
  
      return new Response(JSON.stringify({ success: true, message: "삭제 완료", hasElders: elders.length > 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: "삭제 실패", error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  

    
    