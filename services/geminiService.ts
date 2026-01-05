
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types.ts";

export const scanAnswerSheet = async (base64Image: string): Promise<ScanResult> => {
  // Khởi tạo instance ngay trước khi gọi để đảm bảo lấy đúng API_KEY từ môi trường
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    Bạn là một trợ lý chấm bài trắc nghiệm chuyên nghiệp. 
    Nhiệm vụ của bạn là phân tích hình ảnh của "Phiếu trả lời trắc nghiệm".
    
    Hãy trích xuất:
    1. Số báo danh (SBD): Các ô được tô đen ở cột SBD.
    2. Mã đề: Các ô được tô đen ở cột Mã đề.
    3. Đáp án: Từ câu 1 đến câu 20. Với mỗi câu, xác định chữ cái (A, B, C, D) được tô đen.
    
    Yêu cầu quan trọng:
    - Trả về kết quả chính xác dưới dạng JSON.
    - Nếu một câu không có đáp án nào được chọn, hãy để giá trị là chuỗi rỗng "".
    - Chú ý phần SBD và Mã đề thường nằm ở phía trên cùng của phiếu.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Hãy chấm điểm phiếu trắc nghiệm này và trả về JSON theo định dạng: { 'sbd': '...', 'maDe': '...', 'answers': { '1': 'A', '2': 'B', ... } }",
          },
        ],
      },
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sbd: { type: Type.STRING },
          maDe: { type: Type.STRING },
          answers: {
            type: Type.OBJECT,
            properties: Object.fromEntries(
              Array.from({ length: 20 }, (_, i) => [
                (i + 1).toString(),
                { type: Type.STRING }
              ])
            )
          }
        },
        required: ["sbd", "maDe", "answers"]
      }
    },
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return data as ScanResult;
  } catch (error) {
    console.error("Lỗi khi phân tích phản hồi từ Gemini:", error);
    throw new Error("Không thể phân tích kết quả quét. Vui lòng thử lại.");
  }
};
