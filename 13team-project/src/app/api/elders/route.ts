let elders = [
  {
      elid: 1,
      place_name: "강동구 재가노인복지센터",
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
      hasJobPosting: true, 
      conditions: {
          wage: 13000,
          days: ["월요일", "수요일", "금요일"],
          time: "16~22시",
      },
      jobPosting: {
          condition: ["경력 우대"],
          email: "recruit@center.com"
      },
      forced: false, 
  }
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
            jobConditions: elder.conditions ?? { wage: 0, days: [], time: "" }, 
            jobPosting: elder.jobPosting ?? { condition: [], email: "" },
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
  
      // 필수 필드 검증
      if (!newElder.elderly?.name || !newElder.elderly?.birthYear || !newElder.elderly?.careLevel) {
        return new Response(
          JSON.stringify({ success: false, message: "이름, 생년, 등급을 입력해주세요." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      newElder.elid = elders.length + 1;
      newElder.hasJobPosting = false;
      newElder.conditions = { wage: 0, days: [], time: "" }; 
      newElder.jobPosting = { condition: [], email: "" };
      elders.push(newElder);
  
      return new Response(JSON.stringify({ success: true, elder: newElder }), {
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
  
      elders[elderIndex] = { 
        ...elders[elderIndex], 
        ...updates,
        conditions: { ...elders[elderIndex].conditions, ...updates.conditions },
        jobPosting: { ...elders[elderIndex].jobPosting, ...updates.jobPosting },
    };

      if (updates.jobPosting) {
        elders[elderIndex].hasJobPosting = true;
      }
  
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
  

    
    