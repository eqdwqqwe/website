import axios from 'axios';

export class ChatGLM {
  private readonly apiKey = "36ca51231d044d5c86071f0b12f7fb81.CR2DF03C8VzRXLpf";
  private readonly apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  async getResponse(prompt: string): Promise<string | null> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      };
      
      const payload = {
        "model": "glm-4-flashx",
        "messages": [{ "role": "user", "content": prompt }]
      };
      
      const response = await axios.post(
        this.apiUrl,
        payload,
        { headers }
      );
      
      if (response.status === 200) {
        return response.data.choices[0].message.content;
      }
      
      console.error(`API请求失败: ${response.status}`);
      return null;
      
    } catch (error) {
      console.error(`调用API时出错:`, error);
      return null;
    }
  }
}

export default new ChatGLM();