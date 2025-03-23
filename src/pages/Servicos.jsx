import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [filteredServicos, setFilteredServicos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentServico, setCurrentServico] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracao: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'nome',
    direction: 'asc'
  });

  useEffect(() => {
    fetchServicos();
  }, []);

  useEffect(() => {
    let filtered = servicos.filter(servico =>
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Para campos numéricos
        if (sortConfig.key === 'preco' || sortConfig.key === 'duracao') {
          const valA = parseFloat(a[sortConfig.key]) || 0;
          const valB = parseFloat(b[sortConfig.key]) || 0;
          
          if (valA < valB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (valA > valB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Para campos de texto
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredServicos(filtered);
  }, [searchTerm, servicos, sortConfig]);

  const fetchServicos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/servicos');
      setServicos(response.data);
      setFilteredServicos(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentServico({ ...currentServico, [name]: name === 'preco' || name === 'duracao' ? Number(value) : value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/servicos/${currentServico.id}`, currentServico);
      } else {
        await axios.post('http://localhost:5000/servicos', currentServico);
      }
      fetchServicos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const handleEdit = (servico) => {
    setCurrentServico(servico);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await axios.delete(`http://localhost:5000/servicos/${id}`);
        fetchServicos();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
      }
    }
  };

  const handleShowModal = () => {
    setCurrentServico({
      nome: '',
      descricao: '',
      preco: '',
      duracao: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const formatarDuracao = (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const min = minutos % 60;
      return min > 0 ? `${horas}h ${min}min` : `${horas}h`;
    }
  };

  const formatarPreco = (preco) => {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Container>
      <h1 className="my-4">Gerenciamento de Serviços</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nome ou descrição"
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
            Novo Serviço
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
                <th onClick={() => handleSort('descricao')} style={{ cursor: 'pointer' }}>
                  Descrição {getSortIcon('descricao')}
                </th>
                <th onClick={() => handleSort('preco')} style={{ cursor: 'pointer' }}>
                  Preço {getSortIcon('preco')}
                </th>
                <th onClick={() => handleSort('duracao')} style={{ cursor: 'pointer' }}>
                  Duração {getSortIcon('duracao')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredServicos.map((servico) => (
                <tr key={servico.id}>
                  <td>{servico.id}</td>
                  <td>{servico.nome}</td>
                  <td>{servico.descricao}</td>
                  <td>{formatarPreco(servico.preco)}</td>
                  <td>{formatarDuracao(servico.duracao)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(servico)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(servico.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredServicos.length === 0 && (
            <p className="text-center my-3">Nenhum serviço encontrado.</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal para adicionar/editar serviço */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Serviço' : 'Novo Serviço'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={currentServico.nome}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descricao"
                value={currentServico.descricao}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preço (R$)</Form.Label>
                  <Form.Control
                    type="number"
                    name="preco"
                    value={currentServico.preco}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duração (minutos)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duracao"
                    value={currentServico.duracao}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="1"
                  />
                </Form.Group>
              </Col>
            </Row>
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

export default Servicos;