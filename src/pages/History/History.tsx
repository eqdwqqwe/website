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
  max-width: 1200px;
  margin: 0 auto;
`;

const HistoryContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #1976d2;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #1565c0;
  }
`;

const Timeline = styled.div`
  position: relative;
  margin: 2rem 0;
  padding: 2rem 0;
  
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    background: #1976d2;
    top: 0;
    bottom: 0;
    left: 50%;
    margin-left: -2px;
  }
`;

const TimelineItem = styled.div<{ position: 'left' | 'right' }>`
  width: 50%;
  padding: 1rem;
  position: relative;
  margin-bottom: 2rem;
  ${props => props.position === 'right' ? 'left: 50%;' : ''}

  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border: 3px solid #1976d2;
    border-radius: 50%;
    top: 1.5rem;
    ${props => props.position === 'left' ? 'right: -10px;' : 'left: -10px;'}
    z-index: 1;
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 5px;
  font-size: 20px;
  transition: transform 0.3s ease;
  z-index: 2;

  &:hover {
    transform: scale(1.1);
  }
`;

const TimelineContent = styled.div<{ type: 'analysis' | 'history'; collapsed: boolean }>`
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => props.type === 'analysis' ? '#1976d2' : '#4caf50'};
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    transition: transform 0.3s ease;
  }

  .content-wrapper {
    max-height: ${props => props.collapsed ? '0' : '2000px'};
    overflow: hidden;
    transition: max-height 0.3s ease-out;
  }
`;

const TimelineDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const TimelineType = styled.div<{ type: 'analysis' | 'history' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: white;
  background: ${props => props.type === 'analysis' ? '#1976d2' : '#4caf50'};
  margin-bottom: 1rem;
`;

const ImageContainer = styled.div`
  margin: 1rem 0;
  img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const MetricsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const MetricTag = styled.span`
  background: rgba(25, 118, 210, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #1976d2;
`;

// 类型定义
interface AnalysisRecord {
  type: 'analysis' | 'history';
  timestamp: string;
  metrics_text?: string;
  model_response: string;
  image_path?: string;
  id: string;
}

const History = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_all_messages`);
      const processedData = processHistoryData(response.data);
      setRecords(processedData);
      setLoading(false);
    } catch (error) {
      console.error('获取历史数据失败:', error);
      setLoading(false);
    }
  };

  const processHistoryData = (rawData: any[]): AnalysisRecord[] => {
    const processedRecords: AnalysisRecord[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const record = rawData[i];
      
      if (record.user_input?.includes('作为智普清颜的皮肤分析师')) {
        processedRecords.push({
          type: 'history',
          timestamp: record.timestamp,
          model_response: record.model_response,
          id: `history-${record.timestamp}`
        });
      } else if (record.user_input?.includes('检测到的日常皮肤问题') && i + 1 < rawData.length) {
        const imageRecord = rawData[i + 1];
        if (imageRecord.image_path) {
          processedRecords.push({
            type: 'analysis',
            timestamp: record.timestamp,
            metrics_text: record.user_input,
            model_response: record.model_response,
            image_path: imageRecord.image_path,
            id: `analysis-${record.timestamp}`
          });
          i++;
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
      const match = text?.match(regex);
      if (match && match[1]) {
        metrics[problem] = parseFloat(match[1]);
      }
    });
    
    return metrics;
  };

  const toggleCollapse = (id: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
        <HistoryContainer>
          <Header>
            <Title>皮肤分析历史记录</Title>
            <ButtonGroup>
              <Button onClick={fetchData}>刷新数据</Button>
            </ButtonGroup>
          </Header>

          {loading ? (
            <div>加载中...</div>
          ) : (
            <Timeline>
              {records.map((record, index) => (
                <TimelineItem 
                  key={record.id}
                  position={index % 2 === 0 ? 'left' : 'right'}
                >
                  <TimelineContent 
                    type={record.type}
                    collapsed={collapsedItems.has(record.id)}
                  >
                    <CollapseButton onClick={() => toggleCollapse(record.id)}>
                      {collapsedItems.has(record.id) ? '▼' : '▲'}
                    </CollapseButton>
                    
                    <TimelineDate>
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </TimelineDate>
                    <TimelineType type={record.type}>
                      {record.type === 'analysis' ? '皮肤分析' : '历史趋势分析'}
                    </TimelineType>
                    
                    <div className="content-wrapper">
                      {record.type === 'analysis' && record.image_path && (
                        <ImageContainer>
                          <img 
                            src={`${API_BASE_URL}/${record.image_path}`}
                            alt="皮肤分析图片"
                          />
                        </ImageContainer>
                      )}
                      
                      <div>{record.model_response}</div>
                      
                      {record.type === 'analysis' && record.metrics_text && (
                        <MetricsContainer>
                          {Object.entries(extractMetrics(record.metrics_text)).map(([key, value]) => (
                            <MetricTag key={key}>{key}: {value}%</MetricTag>
                          ))}
                        </MetricsContainer>
                      )}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </HistoryContainer>
      </Content>
    </Container>
  );
};

export default History;