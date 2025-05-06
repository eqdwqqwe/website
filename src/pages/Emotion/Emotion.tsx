import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import background from '../../assets/2.png'; // 导入背景图片

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

// 样式组件
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
  position: relative;
  z-index: 1;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const AnalysisBox = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
`;

interface SkinData {
  timestamp: string;
  metrics: {
    [key: string]: number;
  };
  image_path?: string;
}

interface HistoryAnalysis {
  timestamp: string;
  analysis: string;
}

const Emotion = () => {
  const navigate = useNavigate();
  const [skinData, setSkinData] = useState<SkinData[]>([]);
  const [historyAnalysis, setHistoryAnalysis] = useState<HistoryAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://10.196.102.182:5001/get_all_messages');
      const { processedData, historyData } = processData(response.data);
      setSkinData(processedData);
      setHistoryAnalysis(historyData);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData: any[]) => {
    const processedRecords: SkinData[] = [];
    const historyRecords: HistoryAnalysis[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const record = rawData[i];
      
      if (record.user_input?.includes('检测到的日常皮肤问题') && i + 1 < rawData.length) {
        const imageRecord = rawData[i + 1];
        if (imageRecord.image_path) {
          const metrics = extractMetrics(record.user_input);
          processedRecords.push({
            timestamp: record.timestamp,
            metrics,
            image_path: imageRecord.image_path
          });
          i++;
        }
      }
      
      else if (record.user_input?.includes('作为智普清颜的皮肤分析师')) {
        historyRecords.push({
          timestamp: record.timestamp,
          analysis: record.model_response
        });
      }
    }
    
    const sortedRecords = processedRecords.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      processedData: sortedRecords,
      historyData: historyRecords
    };
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

  const chartData = {
    labels: skinData.map(data => {
      const date = new Date(data.timestamp);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }),
    datasets: [
      '黑眼圈', '色斑', '痘痘', '干燥', '毛孔'
    ].map((problem, index) => ({
      label: problem,
      data: skinData.map(data => data.metrics[problem] || null),
      borderColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ][index],
      tension: 0.3,
      fill: false
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '皮肤状态分析',
        font: { size: 18 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '严重程度 (%)'
        }
      }
    }
  };

  const getLatestAnalysis = () => {
    if (historyAnalysis.length === 0) return null;
    
    const sortedAnalysis = [...historyAnalysis].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedAnalysis[0];
  };

  return (
    <Container>
      <Nav>
        <Logo>
          <span>智普清颜</span>
        </Logo>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <NavItem onClick={() => navigate('/emotion')}>当前状况</NavItem>
          <NavItem onClick={() => navigate('/advice')}>护肤建议</NavItem>
          <NavItem onClick={() => navigate('/history')}>历史记录</NavItem>
          <NavItem onClick={() => navigate('/ai')}>智能问答</NavItem>
        </div>
      </Nav>

      <Content>
        <SectionTitle>皮肤状态分析</SectionTitle>
        <ChartContainer style={{ height: '400px' }}>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </ChartContainer>

        <AnalysisBox>
          <SectionTitle>历史趋势分析</SectionTitle>
          <div>
            {loading ? (
              <div>加载中...</div>
            ) : (
              <>
                {getLatestAnalysis() ? (
                  <div>
                    <p style={{ color: '#2e7d32', fontStyle: 'italic', padding: '15px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                      {getLatestAnalysis()?.analysis}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9em', marginTop: '10px' }}>
                      分析时间: {new Date(getLatestAnalysis()?.timestamp || '').toLocaleString('zh-CN')}
                    </p>
                  </div>
                ) : (
                  <p>暂无历史趋势分析数据</p>
                )}
              </>
            )}
          </div>
        </AnalysisBox>
      </Content>
    </Container>
  );
};

export default Emotion;