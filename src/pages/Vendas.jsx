import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faShoppingCart, faSortUp, faSortDown, faPrint } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [filteredVendas, setFilteredVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentVenda, setCurrentVenda] = useState({
    data: '',
    clienteId: '',
    itens: [],
    total: 0,
    formaPagamento: 'Cartão de Crédito'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    produtoId: '',
    quantidade: 1,
    precoUnitario: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'data',
    direction: 'desc'
  });

  // Opções de forma de pagamento
  const formasPagamento = [
    'Dinheiro',
    'Cartão de Débito',
    'Cartão de Crédito',
    'PIX',
    'Transferência Bancária'
  ];

  useEffect(() => {
    fetchVendas();
    fetchClientes();
    fetchProdutos();
  }, []);

  useEffect(() => {
    let filtered = vendas;
    
    if (searchTerm) {
      filtered = vendas.filter(venda => {
        const cliente = clientes.find(c => c.id === venda.clienteId);
        const dataFormatada = new Date(venda.data).toLocaleDateString('pt-BR');
        
        return (
          (cliente && cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          dataFormatada.includes(searchTerm) ||
          venda.formaPagamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venda.total.toString().includes(searchTerm)
        );
      });
    }
    
    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Para campos numéricos
        if (sortConfig.key === 'total' || sortConfig.key === 'id') {
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
    
    setFilteredVendas(filtered);
  }, [searchTerm, vendas, clientes, sortConfig]);

  const fetchVendas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/vendas');
      setVendas(response.data);
      setFilteredVendas(response.data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
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

  const fetchProdutos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/produtos');
      // Ordenar produtos por nome em ordem alfabética
      const produtosOrdenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setProdutos(produtosOrdenados);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVenda({ ...currentVenda, [name]: value });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'produtoId' && value) {
      const produto = produtos.find(p => p.id === value);
      if (produto) {
        setCurrentItem({
          ...currentItem,
          produtoId: value,
          precoUnitario: Number(produto.preco)
        });
        return;
      }
    }
    
    setCurrentItem({
      ...currentItem,
      [name]: name === 'quantidade' ? Number(value) : value
    });
  };

  const adicionarItem = () => {
    if (!currentItem.produtoId || currentItem.quantidade <= 0) {
      alert('Selecione um produto e informe a quantidade');
      return;
    }
    
    // Verificar se há estoque suficiente
    const produto = produtos.find(p => p.id === currentItem.produtoId);
    if (produto && produto.estoque < currentItem.quantidade) {
      alert(`Estoque insuficiente. Disponível: ${produto.estoque} unidades`);
      return;
    }
    
    const novosItens = [...currentVenda.itens, {
      ...currentItem,
      precoUnitario: Number(currentItem.precoUnitario),
      quantidade: Number(currentItem.quantidade)
    }];
    
    const novoTotal = calcularTotal(novosItens);
    
    setCurrentVenda({
      ...currentVenda,
      itens: novosItens,
      total: novoTotal
    });
    
    // Resetar o item atual
    setCurrentItem({
      produtoId: '',
      quantidade: 1,
      precoUnitario: 0
    });
  };

  const removerItem = (index) => {
    const novosItens = currentVenda.itens.filter((_, i) => i !== index);
    const novoTotal = calcularTotal(novosItens);
    
    setCurrentVenda({
      ...currentVenda,
      itens: novosItens,
      total: novoTotal
    });
  };

  const calcularTotal = (itens) => {
    return itens.reduce((total, item) => total + (item.precoUnitario * item.quantidade), 0);
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

  // Função para atualizar o estoque após uma venda
  const atualizarEstoque = async (itens) => {
    try {
      // Para cada item vendido, atualizar o estoque do produto
      for (const item of itens) {
        // Buscar o produto atual para obter o estoque atualizado
        const response = await axios.get(`http://localhost:5000/produtos/${item.produtoId}`);
        const produto = response.data;
        
        // Calcular novo estoque
        const novoEstoque = Math.max(0, produto.estoque - item.quantidade);
        
        // Atualizar o produto com o novo estoque
        await axios.put(`http://localhost:5000/produtos/${item.produtoId}`, {
          ...produto,
          estoque: novoEstoque
        });
      }
      
      // Atualizar a lista de produtos após as alterações
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      alert('Erro ao atualizar o estoque dos produtos. Verifique o console para mais detalhes.');
    }
  };

  // Função para atualizar o estoque quando uma venda é editada
  const atualizarEstoqueEdicao = async (itensAntigos, itensNovos) => {
    try {
      // Criar um mapa para facilitar a comparação
      const mapaItensAntigos = {};
      itensAntigos.forEach(item => {
        mapaItensAntigos[item.produtoId] = item.quantidade;
      });
      
      const mapaItensNovos = {};
      itensNovos.forEach(item => {
        mapaItensNovos[item.produtoId] = item.quantidade;
      });
      
      // Produtos que foram removidos ou tiveram quantidade reduzida (devolver ao estoque)
      for (const produtoId in mapaItensAntigos) {
        const quantidadeAntiga = mapaItensAntigos[produtoId];
        const quantidadeNova = mapaItensNovos[produtoId] || 0;
        
        if (quantidadeAntiga > quantidadeNova) {
          // Devolver a diferença ao estoque
          const quantidadeDevolver = quantidadeAntiga - quantidadeNova;
          
          // Buscar o produto atual
          const response = await axios.get(`http://localhost:5000/produtos/${produtoId}`);
          const produto = response.data;
          
          // Atualizar o estoque
          await axios.put(`http://localhost:5000/produtos/${produtoId}`, {
            ...produto,
            estoque: produto.estoque + quantidadeDevolver
          });
        }
      }
      
      // Produtos que foram adicionados ou tiveram quantidade aumentada (remover do estoque)
      for (const produtoId in mapaItensNovos) {
        const quantidadeNova = mapaItensNovos[produtoId];
        const quantidadeAntiga = mapaItensAntigos[produtoId] || 0;
        
        if (quantidadeNova > quantidadeAntiga) {
          // Remover a diferença do estoque
          const quantidadeRemover = quantidadeNova - quantidadeAntiga;
          
          // Buscar o produto atual
          const response = await axios.get(`http://localhost:5000/produtos/${produtoId}`);
          const produto = response.data;
          
          // Verificar se há estoque suficiente
          if (produto.estoque < quantidadeRemover) {
            throw new Error(`Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoque} unidades`);
          }
          
          // Atualizar o estoque
          await axios.put(`http://localhost:5000/produtos/${produtoId}`, {
            ...produto,
            estoque: produto.estoque - quantidadeRemover
          });
        }
      }
      
      // Atualizar a lista de produtos após as alterações
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentVenda.itens.length === 0) {
      alert('Adicione pelo menos um item à venda');
      return;
    }
    
    try {
      const vendaData = {
        ...currentVenda,
        total: calcularTotal(currentVenda.itens).toString()
      };
      
      if (editMode) {
        // Verificar estoque para itens novos ou com quantidade aumentada
        try {
          // Obter a venda original que foi armazenada no handleEdit
          const itensAntigos = window.vendaOriginal.itens;
          
          // Atualizar o estoque com base nas diferenças entre os itens antigos e novos
          await atualizarEstoqueEdicao(itensAntigos, currentVenda.itens);
          
          // Salvar a venda atualizada
          await axios.put(`http://localhost:5000/vendas/${currentVenda.id}`, vendaData);
          
          // Limpar a venda original armazenada
          delete window.vendaOriginal;
        } catch (error) {
          if (error.message && error.message.includes('Estoque insuficiente')) {
            alert(error.message);
            return;
          }
          throw error;
        }
      } else {
        // Verificar estoque de todos os produtos antes de finalizar a venda
        for (const item of currentVenda.itens) {
          const produto = produtos.find(p => p.id === item.produtoId);
          if (produto && produto.estoque < item.quantidade) {
            alert(`Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoque} unidades`);
            return;
          }
        }
        
        // Salvar a venda
        await axios.post('http://localhost:5000/vendas', vendaData);
        
        // Atualizar o estoque dos produtos vendidos
        await atualizarEstoque(currentVenda.itens);
      }
      
      fetchVendas();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar a venda. Verifique o console para mais detalhes.');
    }
  };

  const handlePrintInvoice = (venda) => {
    // Buscar informações do cliente
    const cliente = clientes.find(c => c.id === venda.clienteId);
    
    // Criar uma nova janela para a impressão
    const printWindow = window.open('', '_blank');
    
    // Estilos CSS para a fatura
    const styles = `
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { text-align: center; margin-bottom: 30px; }
      .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .invoice-info div { flex: 1; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .total { text-align: right; font-weight: bold; margin-top: 20px; }
      .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
      @media print { .no-print { display: none; } }
    `;
    
    // Conteúdo HTML da fatura
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fatura #${venda.id}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="header">
          <h1>Pet Shop</h1>
          <h2>Fatura #${venda.id}</h2>
        </div>
        
        <div class="invoice-info">
          <div>
            <h3>Cliente:</h3>
            <p><strong>Nome:</strong> ${cliente ? cliente.nome : 'Cliente não encontrado'}</p>
            <p><strong>Email:</strong> ${cliente ? cliente.email : '-'}</p>
            <p><strong>Telefone:</strong> ${cliente ? cliente.telefone : '-'}</p>
          </div>
          <div>
            <h3>Informações da Venda:</h3>
            <p><strong>Data:</strong> ${formatarData(venda.data)}</p>
            <p><strong>Forma de Pagamento:</strong> ${venda.formaPagamento}</p>
            <p><strong>ID da Venda:</strong> ${venda.id}</p>
          </div>
        </div>
        
        <h3>Itens:</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${venda.itens.map(item => `
              <tr>
                <td>${getProdutoNome(item.produtoId)}</td>
                <td>${item.quantidade}</td>
                <td>${formatarPreco(item.precoUnitario)}</td>
                <td>${formatarPreco(item.precoUnitario * item.quantidade)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <h3>Total: ${formatarPreco(venda.total)}</h3>
        </div>
        
        <div class="footer">
          <p>Obrigado por sua compra!</p>
          <p>Pet Shop - Todos os direitos reservados</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print();" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Imprimir Fatura
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Escrever o conteúdo na nova janela
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleEdit = (venda) => {
    // Formatar a data para o formato esperado pelo input datetime-local
    const dataFormatada = new Date(venda.data).toISOString().slice(0, 16);
    
    // Armazenar a venda original para comparar os itens depois
    window.vendaOriginal = JSON.parse(JSON.stringify(venda));
    
    setCurrentVenda({
      ...venda,
      data: dataFormatada
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await axios.delete(`http://localhost:5000/vendas/${id}`);
        fetchVendas();
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
      }
    }
  };

  const handleShowModal = () => {
    const agora = new Date();
    
    setCurrentVenda({
      data: agora.toISOString().slice(0, 16),
      clienteId: '',
      itens: [],
      total: 0,
      formaPagamento: 'Cartão de Crédito'
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getProdutoNome = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? produto.nome : 'Produto não encontrado';
  };

  const formatarPreco = (preco) => {
    return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  return (
    <Container>
      <h1 className="my-4">Gerenciamento de Vendas</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por cliente, data ou forma de pagamento"
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
            Nova Venda
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
                  Data {getSortIcon('data')}
                </th>
                <th onClick={() => handleSort('clienteId')} style={{ cursor: 'pointer' }}>
                  Cliente {getSortIcon('clienteId')}
                </th>
                <th>
                  Itens
                </th>
                <th onClick={() => handleSort('total')} style={{ cursor: 'pointer' }}>
                  Total {getSortIcon('total')}
                </th>
                <th onClick={() => handleSort('formaPagamento')} style={{ cursor: 'pointer' }}>
                  Forma de Pagamento {getSortIcon('formaPagamento')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendas.map((venda) => (
                <tr key={venda.id}>
                  <td>{venda.id}</td>
                  <td>{formatarData(venda.data)}</td>
                  <td>{getClienteNome(venda.clienteId)}</td>
                  <td>{venda.itens.length} {venda.itens.length === 1 ? 'item' : 'itens'}</td>
                  <td>{formatarPreco(venda.total)}</td>
                  <td>{venda.formaPagamento}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(venda)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleDelete(venda.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Button variant="outline-success" size="sm" onClick={() => handlePrintInvoice(venda)}>
                      <FontAwesomeIcon icon={faPrint} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredVendas.length === 0 && (
            <p className="text-center my-3">Nenhuma venda encontrada.</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal para adicionar/editar venda */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Venda' : 'Nova Venda'}</Modal.Title>
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
                    value={currentVenda.data}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    name="clienteId"
                    value={currentVenda.clienteId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Card>
                  <Card.Header>Adicionar Itens</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Produto</Form.Label>
                          <Form.Select
                            name="produtoId"
                            value={currentItem.produtoId}
                            onChange={handleItemChange}
                          >
                            <option value="">Selecione um produto</option>
                            {produtos.map(produto => (
                              <option key={produto.id} value={produto.id}>
                                {produto.nome} - {formatarPreco(produto.preco)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Quantidade</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            name="quantidade"
                            value={currentItem.quantidade}
                            onChange={handleItemChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Preço Unit.</Form.Label>
                          <Form.Control
                            type="text"
                            value={formatarPreco(currentItem.precoUnitario)}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-flex align-items-end">
                        <Button variant="success" onClick={adicionarItem} className="w-100">
                          <FontAwesomeIcon icon={faPlus} className="me-1" /> Adicionar
                        </Button>
                      </Col>
                    </Row>

                    <hr />

                    {currentVenda.itens.length > 0 ? (
                      <div>
                        <h6>Itens Adicionados:</h6>
                        <ListGroup className="mb-3">
                          {currentVenda.itens.map((item, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{getProdutoNome(item.produtoId)}</strong>
                                <Badge bg="secondary" className="ms-2">
                                  {item.quantidade} {item.quantidade > 1 ? 'unidades' : 'unidade'}
                                </Badge>
                              </div>
                              <div>
                                <span className="me-3">{formatarPreco(item.precoUnitario * item.quantidade)}</span>
                                <Button variant="danger" size="sm" onClick={() => removerItem(index)}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        <div className="text-end mb-3">
                          <h5>Total: {formatarPreco(currentVenda.total)}</h5>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted my-3">Nenhum item adicionado.</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Forma de Pagamento</Form.Label>
                  <Form.Select
                    name="formaPagamento"
                    value={currentVenda.formaPagamento}
                    onChange={handleInputChange}
                    required
                  >
                    {formasPagamento.map(forma => (
                      <option key={forma} value={forma}>
                        {forma}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Atualizar' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Vendas;