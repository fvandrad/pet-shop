import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentCliente, setCurrentCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    dataCadastro: new Date().toISOString().split('T')[0]
  });
  const [editMode, setEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'nome',
    direction: 'asc'
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    let filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm)
    );
    
    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredClientes(filtered);
  }, [searchTerm, clientes, sortConfig]);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/clientes');
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCliente({ ...currentCliente, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/clientes/${currentCliente.id}`, currentCliente);
      } else {
        await axios.post('http://localhost:5000/clientes', currentCliente);
      }
      fetchClientes();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleEdit = (cliente) => {
    setCurrentCliente(cliente);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await axios.delete(`http://localhost:5000/clientes/${id}`);
        fetchClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  const handleShowModal = () => {
    setCurrentCliente({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      dataCadastro: new Date().toISOString().split('T')[0]
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <FontAwesomeIcon icon={faSortUp} className="ms-1" /> : 
      <FontAwesomeIcon icon={faSortDown} className="ms-1" />;
  };

  return (
    <Container>
      <h1 className="my-4">Gerenciamento de Clientes</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nome, email ou telefone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="d-inline-block"
            />
            <FontAwesomeIcon icon={faSearch} className="ms-2" />
          </Form.Group>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={handleShowModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Novo Cliente
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  # {getSortIcon('id')}
                </th>
                <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>
                  Nome {getSortIcon('nome')}
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('telefone')} style={{ cursor: 'pointer' }}>
                  Telefone {getSortIcon('telefone')}
                </th>
                <th onClick={() => handleSort('endereco')} style={{ cursor: 'pointer' }}>
                  Endereço {getSortIcon('endereco')}
                </th>
                <th onClick={() => handleSort('dataCadastro')} style={{ cursor: 'pointer' }}>
                  Data de Cadastro {getSortIcon('dataCadastro')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.endereco}</td>
                  <td>{new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(cliente)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cliente.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredClientes.length === 0 && (
            <p className="text-center my-3">Nenhum cliente encontrado.</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal para adicionar/editar cliente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={currentCliente.nome}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={currentCliente.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                name="telefone"
                value={currentCliente.telefone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                type="text"
                name="endereco"
                value={currentCliente.endereco}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Salvar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Clientes;