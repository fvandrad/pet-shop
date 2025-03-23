import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faUser, faCalendarAlt, faCut, faBoxOpen, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [stats, setStats] = useState({
    clientes: 0,
    pets: 0,
    agendamentos: 0,
    servicosPendentes: 0,
    produtos: 0,
    vendas: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientes, pets, agendamentos, produtos, vendas] = await Promise.all([
          axios.get('http://localhost:5000/clientes'),
          axios.get('http://localhost:5000/pets'),
          axios.get('http://localhost:5000/agendamentos'),
          axios.get('http://localhost:5000/produtos'),
          axios.get('http://localhost:5000/vendas')
        ]);

        const servicosPendentes = agendamentos.data.filter(a => a.status === 'Agendado').length;

        setStats({
          clientes: clientes.data.length,
          pets: pets.data.length,
          agendamentos: agendamentos.data.length,
          servicosPendentes,
          produtos: produtos.data.length,
          vendas: vendas.data.length
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container>
      <h1 className="my-4 text-center">Sistema de Gerenciamento de Pet Shop</h1>
      <p className="text-center mb-5">Bem-vindo ao sistema de gerenciamento. Selecione uma opção abaixo para começar.</p>
      
      <Row className="g-4">
        <Col md={4}>
          <Card as={Link} to="/clientes" className="h-100 text-decoration-none">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon icon={faUser} size="3x" className="mb-3 text-primary" />
              <Card.Title>Clientes</Card.Title>
              <Card.Text className="text-center">
                Gerenciar cadastro de clientes
                <p className="mt-2 fs-4 fw-bold">{stats.clientes}</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card as={Link} to="/pets" className="h-100 text-decoration-none">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon icon={faPaw} size="3x" className="mb-3 text-primary" />
              <Card.Title>Pets</Card.Title>
              <Card.Text className="text-center">
                Gerenciar cadastro de pets
                <p className="mt-2 fs-4 fw-bold">{stats.pets}</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card as={Link} to="/servicos" className="h-100 text-decoration-none">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon icon={faCut} size="3x" className="mb-3 text-primary" />
              <Card.Title>Serviços</Card.Title>
              <Card.Text className="text-center">
                Gerenciar serviços oferecidos
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card as={Link} to="/agendamentos" className="h-100 text-decoration-none">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="mb-3 text-primary" />
              <Card.Title>Agendamentos</Card.Title>
              <Card.Text className="text-center">
                Gerenciar agendamentos
                <p className="mt-2 fs-4 fw-bold">{stats.agendamentos} <span className="fs-6 text-warning">(Pendentes: {stats.servicosPendentes})</span></p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card as={Link} to="/produtos" className="h-100 text-decoration-none">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 text-primary" />
              <Card.Title>Produtos</Card.Title>
              <Card.Text className="text-center">
                Gerenciar estoque de produtos
                <p className="mt-2 fs-4 fw-bold">{stats.produtos}</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card as={Link} to="/vendas" className="h-100 text-decoration-none">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon icon={faMoneyBillWave} size="3x" className="mb-3 text-primary" />
              <Card.Title>Vendas</Card.Title>
              <Card.Text className="text-center">
                Gerenciar vendas de produtos
                <p className="mt-2 fs-4 fw-bold">{stats.vendas}</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;