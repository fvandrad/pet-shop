import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faUser, faCalendarAlt, faCut, faBoxOpen, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

function NavbarComponent() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FontAwesomeIcon icon={faPaw} className="me-2" /> Pet Shop
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/clientes">
              <FontAwesomeIcon icon={faUser} className="me-1" /> Clientes
            </Nav.Link>
            <Nav.Link as={Link} to="/pets">
              <FontAwesomeIcon icon={faPaw} className="me-1" /> Pets
            </Nav.Link>
            <Nav.Link as={Link} to="/servicos">
              <FontAwesomeIcon icon={faCut} className="me-1" /> Serviços
            </Nav.Link>
            <Nav.Link as={Link} to="/agendamentos">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Agendamentos
            </Nav.Link>
            <Nav.Link as={Link} to="/produtos">
              <FontAwesomeIcon icon={faBoxOpen} className="me-1" /> Produtos
            </Nav.Link>
            <Nav.Link as={Link} to="/vendas">
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> Vendas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;