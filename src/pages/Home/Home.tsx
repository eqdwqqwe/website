import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import background from '../../assets/1.png';
import logo from '../../assets/3.png';

const PageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Container = styled.div`
  width: 95%;
  height: 95%;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  background: url(${background}) no-repeat center center;
  background-size: cover;
`;

const Nav = styled.nav`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2rem;
  padding: 0.5rem 2rem;
  border-radius: 20px;
  z-index: 2;
`;

const NavItem = styled.div<{ active: boolean }>`
  cursor: pointer;
  padding: 0.5rem 2rem;
  border-radius: 20px;
  color: ${props => props.active ? '#ffffff' : '#666666'};
  background: ${props => props.active ? '#90EE90' : 'transparent'};
  transition: all 0.3s ease;
  font-size: 1.2rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    color: ${props => props.active ? '#ffffff' : '#333333'};
  }
`;

const Logo = styled.img`
  position: absolute;
  top: 20px;
  left: 20px;
  height: 40px;
  width: auto;
  z-index: 2;
`;

const Button = styled.button`
  position: absolute;
  bottom: 200px;
  right: 80px;
  padding: 85px 150px;
  border: 2px solid #004d40;
  border-radius: 300px;
  font-size: 4rem;
  font-weight: bold;
  cursor: pointer;
  background: rgba(255, 255, 255, 0);
  color: #004d40;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', sans-serif;

  &:hover {
    background: #004d40;
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 只在首页不显示导航栏和 logo
  const isHomePage = location.pathname === '/';

  return (
    <PageWrapper>
      <Container>
        {!isHomePage && (
          <>
            <Logo src={logo} alt="智普清颜" />
            <Nav>
              <NavItem 
                active={location.pathname === '/emotion'} 
                onClick={() => navigate('/emotion')}
              >
                当前状况
              </NavItem>
              <NavItem 
                active={location.pathname === '/advice'} 
                onClick={() => navigate('/advice')}
              >
                护肤建议
              </NavItem>
              <NavItem 
                active={location.pathname === '/history'} 
                onClick={() => navigate('/history')}
              >
                历史记录
              </NavItem>
              <NavItem 
                active={location.pathname === '/ai'} 
                onClick={() => navigate('/ai')}
              >
                智能问答
              </NavItem>
            </Nav>
          </>
        )}
        <Button onClick={() => navigate('/emotion')}>
          了解更多
        </Button>
      </Container>
    </PageWrapper>
  );
};

export default Home;
