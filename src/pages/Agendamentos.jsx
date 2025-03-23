import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faCheck, faTimes, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [currentAgendamento, setCurrentAgendamento] = useState({
    data: '',
    clienteId: '',
    petId: '',
    servicoId: '',
    status: 'Agendado',
    observacoes: '',
    valor: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [petsFiltrados, setPetsFiltrados] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'data',
    direction: 'desc'
  });

  useEffect(() => {
    fetchAgendamentos();
    fetchClientes();
    fetchPets();
    fetchServicos();
  }, []);

  useEffect(() => {
    let filtered = agendamentos;
    
    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(agendamento => {
        const cliente = clientes.find(c => c.id === agendamento.clienteId);
        const pet = pets.find(p => p.id === agendamento.petId);
        const servico = servicos.find(s => s.id === agendamento.servicoId);
        
        return (
          (cliente && cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pet && pet.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (servico && servico.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          agendamento.observacoes.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Filtro por status
    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(agendamento => agendamento.status === statusFilter);
    }
    
    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Para campos numéricos
        if (sortConfig.key === 'valor' || sortConfig.key === 'id') {
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
        
        // Para campo de data
        if (sortConfig.key === 'data') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          
          if (dateA < dateB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Para campos de texto e outros
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredAgendamentos(filtered);
  }, [searchTerm, statusFilter, agendamentos, clientes, pets, servicos, sortConfig]);

  // Atualiza a lista de pets quando o cliente é alterado
  useEffect(() => {
    if (currentAgendamento.clienteId) {
      const petsDoCliente = pets.filter(pet => pet.clienteId === currentAgendamento.clienteId);
      setPetsFiltrados(petsDoCliente);
      
      // Se o pet selecionado não pertence ao cliente, limpa a seleção
      if (currentAgendamento.petId && !petsDoCliente.some(p => p.id === currentAgendamento.petId)) {
        setCurrentAgendamento(prev => ({ ...prev, petId: '' }));
      }
    } else {
      setPetsFiltrados([]);
    }
  }, [currentAgendamento.clienteId, pets]);

  const fetchAgendamentos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/agendamentos');
      setAgendamentos(response.data);
      setFilteredAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/clientes');
      // Ordenar clientes por nome em ordem alfabética
      const clientesOrdenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setClientes(clientesOrdenados);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pets');
      // Ordenar pets por nome em ordem alfabética
      const petsOrdenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setPets(petsOrdenados);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
    }
  };

  const fetchServicos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/servicos');
      // Ordenar serviços por nome em ordem alfabética
      const servicosOrdenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setServicos(servicosOrdenados);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'servicoId' && value) {
      const servico = servicos.find(s => s.id === value);
      if (servico) {
        setCurrentAgendamento({
          ...currentAgendamento,
          [name]: value,
          valor: servico.preco
        });
        return;
      }
    }
    
    setCurrentAgendamento({
      ...currentAgendamento,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/agendamentos/${currentAgendamento.id}`, currentAgendamento);
      } else {
        await axios.post('http://localhost:5000/agendamentos', currentAgendamento);
      }
      fetchAgendamentos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleEdit = (agendamento) => {
    // Formatar a data para o formato esperado pelo input datetime-local
    const dataFormatada = new Date(agendamento.data).toISOString().slice(0, 16);
    
    setCurrentAgendamento({
      ...agendamento,
      data: dataFormatada
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await axios.delete(`http://localhost:5000/agendamentos/${id}`);
        fetchAgendamentos();
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
      }
    }
  };

  const handleShowModal = () => {
    const agora = new Date();
    // Arredonda para a próxima hora completa
    agora.setHours(agora.getHours() + 1);
    agora.setMinutes(0);
    agora.setSeconds(0);
    
    setCurrentAgendamento({
      data: agora.toISOString().slice(0, 16),
      clienteId: '',
      petId: '',
      servicoId: '',
      status: 'Agendado',
      observacoes: '',
      valor: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleStatusChange = async (id, novoStatus) => {
    try {
      const agendamento = agendamentos.find(a => a.id === id);
      if (agendamento) {
        await axios.patch(`http://localhost:5000/agendamentos/${id}`, { status: novoStatus });
        fetchAgendamentos();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getPetNome = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.nome : 'Pet não encontrado';
  };

  const getServicoNome = (servicoId) => {
    const servico = servicos.find(s => s.id === servicoId);
    return servico ? servico.nome : 'Serviço não encontrado';
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarPreco = (preco) => {
    return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Agendado':
        return <Badge bg="warning">Agendado</Badge>;
      case 'Concluído':
        return <Badge bg="success">Concluído</Badge>;
      case 'Cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
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
      <h1 className="my-4">Gerenciamento de Agendamentos</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por cliente, pet ou serviço"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="d-inline-block"
            />
            <FontAwesomeIcon icon={faSearch} className="ms-2" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Agendado">Agendados</option>
              <option value="Concluído">Concluídos</option>
              <option value="Cancelado">Cancelados</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="primary" onClick={handleShowModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Novo Agendamento
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
                <th onClick={() => handleSort('data')} style={{ cursor: 'pointer' }}>
                  Data e Hora {getSortIcon('data')}
                </th>
                <th onClick={() => handleSort('clienteId')} style={{ cursor: 'pointer' }}>
                  Cliente {getSortIcon('clienteId')}
                </th>
                <th onClick={() => handleSort('petId')} style={{ cursor: 'pointer' }}>
                  Pet {getSortIcon('petId')}
                </th>
                <th onClick={() => handleSort('servicoId')} style={{ cursor: 'pointer' }}>
                  Serviço {getSortIcon('servicoId')}
                </th>
                <th onClick={() => handleSort('valor')} style={{ cursor: 'pointer' }}>
                  Valor {getSortIcon('valor')}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status {getSortIcon('status')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgendamentos.map((agendamento) => (
                <tr key={agendamento.id}>
                  <td>{agendamento.id}</td>
                  <td>{formatarData(agendamento.data)}</td>
                  <td>{getClienteNome(agendamento.clienteId)}</td>
                  <td>{getPetNome(agendamento.petId)}</td>
                  <td>{getServicoNome(agendamento.servicoId)}</td>
                  <td>{formatarPreco(agendamento.valor)}</td>
                  <td>{getStatusBadge(agendamento.status)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(agendamento)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    {agendamento.status === 'Agendado' && (
                      <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleStatusChange(agendamento.id, 'Concluído')}>
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                    )}
                    {agendamento.status === 'Agendado' && (
                      <Button variant="outline-danger" size="sm" className="me-1" onClick={() => handleStatusChange(agendamento.id, 'Cancelado')}>
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    )}
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(agendamento.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredAgendamentos.length === 0 && (
            <p className="text-center my-3">Nenhum agendamento encontrado.</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal para adicionar/editar agendamento */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Agendamento' : 'Novo Agendamento'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data e Hora</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="data"
                    value={currentAgendamento.data}
                    onChange={handleInputChange}
                    required                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    name="clienteId"
                    value={currentAgendamento.clienteId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pet</Form.Label>
                  <Form.Select
                    name="petId"
                    value={currentAgendamento.petId}
                    onChange={handleInputChange}
                    required
                    disabled={!currentAgendamento.clienteId}
                  >
                    <option value="">Selecione o pet</option>
                    {petsFiltrados.map(pet => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} ({pet.tipo})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Serviço</Form.Label>
                  <Form.Select
                    name="servicoId"
                    value={currentAgendamento.servicoId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o serviço</option>
                    {servicos.map(servico => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome} - {servico.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor</Form.Label>
                  <Form.Control
                    type="number"
                    name="valor"
                    value={currentAgendamento.valor}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={currentAgendamento.status}
                onChange={handleInputChange}
                required
              >
                <option value="Agendado">Agendado</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observacoes"
                value={currentAgendamento.observacoes}
                onChange={handleInputChange}
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

export default Agendamentos;
