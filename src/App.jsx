import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavbarComponent from './components/Navbar';
import Home from './pages/Home';
import Clientes from './pages/Clientes';
import Pets from './pages/Pets';
import Servicos from './pages/Servicos';
import Agendamentos from './pages/Agendamentos';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <NavbarComponent />
      <Container className="py-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/vendas" element={<Vendas />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
