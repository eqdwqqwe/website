import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import background from '../../assets/2.png'; // 导入背景图片

// API 配置
const API_BASE_URL = 'http://10.196.102.182:5001';

// 修改 Container 样式，使用背景图片
const Container = styled.div`
  min-height: 100vh;
  background: url(${background}) no-repeat center center;
  background-size: cover;
  position: relative;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled.div`
  cursor: pointer;
  padding: 0.5rem 1rem;
  &:hover {
    color: #1976d2;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Content = styled.div`
  padding: 2rem;
  width: 100%;
  height: calc(100vh - 64px); // 减去导航栏高度
`;

const AnalysisContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr; // 改为单列
  height: 100%;
  margin: 0; // 移除左边距
`;

const AnalysisPanel = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: hidden; // 防止内容溢出
  position: relative;
`;

const PageTitle = styled.h1`
  text-align: center;
  color: #1976d2;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 500;
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: white;
  padding: 1rem 0;
  z-index: 1;
`;

const MainContent = styled.div`
  margin-top: 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: calc(100% - 6rem);
  padding: 0 2rem;
  position: relative;
`;

const ImageContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: flex-start; // 改为顶部对齐
  margin-top: 0; // 确保没有上边距
  img {
    width: 100%;
    height: auto;
    max-height: calc(100% - 2rem); // 留出一些底部空间
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
  margin-top: 0;
`;

const AnalysisText = styled.div`
  flex: 1;
  padding: 1.5rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  color: #2e7d32;
  overflow-y: auto;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-top: 0;
  margin-bottom: 7rem;
`;

const NavigationButtons = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 4rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-width: 100px; // 确保按钮宽度一致
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #1565c0;
  }
`;

const Timestamp = styled.div`
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  color: #666;
  font-size: 0.9em;
  text-align: center;
  width: auto;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// 类型定义
interface AnalysisRecord {
  timestamp: string;
  user_input: string;
  model_response: string;
  image_path: string;
  metrics?: {
    [key: string]: number;
  };
}

const Advice = () => {
  const navigate = useNavigate();
  const [analysisRecords, setAnalysisRecords] = useState<AnalysisRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_all_messages`);
      const processedData = processAnalysisData(response.data);
      setAnalysisRecords(processedData);
      setLoading(false);
    } catch (error) {
      console.error('获取数据失败:', error);
      setLoading(false);
    }
  };

  const processAnalysisData = (rawData: any[]): AnalysisRecord[] => {
    const processedRecords: AnalysisRecord[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const record = rawData[i];
      if (record.user_input?.includes('检测到的日常皮肤问题') && i + 1 < rawData.length) {
        const imageRecord = rawData[i + 1];
        if (imageRecord.image_path) {
          processedRecords.push({
            timestamp: record.timestamp,
            user_input: record.user_input,
            model_response: record.model_response,
            image_path: imageRecord.image_path,
            metrics: extractMetrics(record.user_input)
          });
          i++; // 跳过图片记录
        }
      }
    }
    
    return processedRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const extractMetrics = (text: string) => {
    const metrics: { [key: string]: number } = {};
    const problems = ['黑眼圈', '色斑', '痘痘', '干燥', '毛孔'];
    
    problems.forEach(problem => {
      const regex = new RegExp(`${problem}:\\s*(\\d+\\.?\\d*)%`);
      const match = text.match(regex);
      if (match && match[1]) {
        metrics[problem] = parseFloat(match[1]);
      }
    });
    
    return metrics;
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.min(prev + 1, analysisRecords.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <Container>
      <Nav>
        <Logo>智普清颜</Logo>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <NavItem onClick={() => navigate('/emotion')}>当前状况</NavItem>
          <NavItem onClick={() => navigate('/advice')}>护肤建议</NavItem>
          <NavItem onClick={() => navigate('/history')}>历史记录</NavItem>
          <NavItem onClick={() => navigate('/ai')}>智能问答</NavItem>
        </div>
      </Nav>

      <Content>
        <AnalysisContainer>
          <AnalysisPanel>
            <PageTitle>皮肤检测与护肤建议</PageTitle>
            {loading ? (
              <div>加载中...</div>
            ) : analysisRecords.length > 0 ? (
              <MainContent>
                <ImageContainer>
                  <img 
                    src={`${API_BASE_URL}/${analysisRecords[currentIndex].image_path}`} 
                    alt="皮肤分析" 
                  />
                </ImageContainer>
                
                <RightContent>
                  <AnalysisText>
                    {analysisRecords[currentIndex].model_response}
                  </AnalysisText>
                  
                  <Timestamp>
                    分析时间: {new Date(analysisRecords[currentIndex].timestamp).toLocaleString('zh-CN')}
                  </Timestamp>
                  
                  <NavigationButtons>
                    <Button 
                      onClick={handleNext} 
                      disabled={currentIndex === 0}
                    >
                      较新记录
                    </Button>
                    <Button 
                      onClick={handlePrevious} 
                      disabled={currentIndex === analysisRecords.length - 1}
                    >
                      较早记录
                    </Button>
                  </NavigationButtons>
                </RightContent>
              </MainContent>
            ) : (
              <div>暂无分析记录</div>
            )}
          </AnalysisPanel>
          
          <div>
            {/* 右侧将添加护肤建议内容 */}
          </div>
        </AnalysisContainer>
      </Content>
    </Container>
  );
};

export default Advice;