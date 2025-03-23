import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentProduto, setCurrentProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'nome',
    direction: 'asc'
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    let filtered = produtos.filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Para campos numéricos
        if (sortConfig.key === 'preco' || sortConfig.key === 'estoque' || sortConfig.key === 'id') {
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
    
    setFilteredProdutos(filtered);
  }, [searchTerm, produtos, sortConfig]);

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

  const fetchProdutos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/produtos');
      setProdutos(response.data);
      setFilteredProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduto({ ...currentProduto, [name]: name === 'preco' || name === 'estoque' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/produtos/${currentProduto.id}`, currentProduto);
      } else {
        await axios.post('http://localhost:5000/produtos', currentProduto);
      }
      fetchProdutos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleEdit = (produto) => {
    setCurrentProduto(produto);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await axios.delete(`http://localhost:5000/produtos/${id}`);
        fetchProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const handleShowModal = () => {
    setCurrentProduto({
      nome: '',
      descricao: '',
      preco: '',
      estoque: '',
      categoria: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const formatarPreco = (preco) => {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Container>
      <h1 className="my-4">Gerenciamento de Produtos</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nome, descrição ou categoria"
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
            Novo Produto
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
                <th onClick={() => handleSort('estoque')} style={{ cursor: 'pointer' }}>
                  Estoque {getSortIcon('estoque')}
                </th>
                <th onClick={() => handleSort('categoria')} style={{ cursor: 'pointer' }}>
                  Categoria {getSortIcon('categoria')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProdutos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.id}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.descricao}</td>
                  <td>{formatarPreco(produto.preco)}</td>
                  <td>{produto.estoque}</td>
                  <td>{produto.categoria}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(produto)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(produto.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredProdutos.length === 0 && (
            <p className="text-center my-3">Nenhum produto encontrado.</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal para adicionar/editar produto */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={currentProduto.nome}
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
                value={currentProduto.descricao}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preço</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="preco"
                value={currentProduto.preco}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estoque</Form.Label>
              <Form.Control
                type="number"
                min="0"
                name="estoque"
                value={currentProduto.estoque}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoria</Form.Label>
              <Form.Control
                type="text"
                name="categoria"
                value={currentProduto.categoria}
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

export default Produtos;