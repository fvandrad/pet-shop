import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faSortUp, faSortDown, faPrint } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

function Pets() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPet, setCurrentPet] = useState({
    nome: '',
    tipo: '',
    raca: '',
    idade: '',
    peso: '',
    clienteId: '',
    observacoes: '',
    imagemId: null,
    imagem: null
  });
  const [editMode, setEditMode] = useState(false);
  const [imagensPets, setImagensPets] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'nome',
    direction: 'asc'
  });

  useEffect(() => {
    fetchPets();
    fetchClientes();
    fetchImagensPets();
    fetchAgendamentos();
    fetchVendas();
  }, []);

  useEffect(() => {
    let filtered = pets;
    
    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(pet =>
        pet.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.raca.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por cliente/dono
    if (clienteFilter) {
      filtered = filtered.filter(pet => pet.clienteId === clienteFilter);
    }
    
    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Tratamento especial para o campo 'dono' que é na verdade clienteId
        if (sortConfig.key === 'dono') {
          const clienteA = clientes.find(c => c.id === a.clienteId);
          const clienteB = clientes.find(c => c.id === b.clienteId);
          const nomeA = clienteA ? clienteA.nome.toLowerCase() : '';
          const nomeB = clienteB ? clienteB.nome.toLowerCase() : '';
          
          if (nomeA < nomeB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (nomeA > nomeB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Para campos numéricos
        if (sortConfig.key === 'idade' || sortConfig.key === 'peso') {
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
    
    setFilteredPets(filtered);
  }, [searchTerm, clienteFilter, pets, sortConfig, clientes]);

  const fetchPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pets');
      setPets(response.data);
      setFilteredPets(response.data);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
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

  const fetchImagensPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/imagensPets');
      setImagensPets(response.data);
    } catch (error) {
      console.error('Erro ao buscar imagens dos pets:', error);
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/agendamentos');
      setAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const fetchVendas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/vendas');
      setVendas(response.data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPet({ ...currentPet, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Opções para compressão e conversão
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 200,
          useWebWorker: true,
          fileType: 'image/webp'
        };

        // Comprimir e converter a imagem
        const compressedFile = await imageCompression(file, options);
        
        // Criar preview da imagem comprimida
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentPet({
            ...currentPet,
            imagem: reader.result
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Erro ao processar a imagem:', error);
        alert('Erro ao processar a imagem. Por favor, tente novamente.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let petData = { ...currentPet };
      let imagemId = null; // Inicializa como null para garantir que não haja referência a imagens inexistentes
      
      // Se tiver uma nova imagem, tenta salvá-la primeiro
      if (currentPet.imagem) {
        // Verifica se a imagem está em formato válido
        if (!currentPet.imagem.startsWith('data:image')) {
          alert('Formato de imagem inválido. Por favor, selecione uma imagem válida.');
          return;
        }

        // Verifica o tamanho da imagem (aproximadamente, baseado no tamanho da string base64)
        const tamanhoAproximadoKB = Math.round(currentPet.imagem.length * 0.75 / 1024);
        if (tamanhoAproximadoKB > 1500) { // Limite de 1.5MB
          alert(`Imagem muito grande (${tamanhoAproximadoKB}KB). Por favor, selecione uma imagem menor.`);
          return;
        }
        
        // Prepara os dados da imagem com um ID único para evitar conflitos
        const timestamp = new Date().getTime();
        const nomeArquivo = `${currentPet.nome.replace(/\s+/g, '_')}_${timestamp}.webp`;
        
        const imagemData = {
          petId: currentPet.id || 'temp',
          nome: nomeArquivo,
          data: currentPet.imagem
        };
        
        // Salva a imagem diretamente no JSON
        try {
          let imagemResponse;
          
          // Se estiver editando e já tiver uma imagem, atualiza
          if (editMode && currentPet.imagemId) {
            console.log(`Atualizando imagem ID: ${currentPet.imagemId}`);
            imagemResponse = await axios.put(`http://localhost:5000/imagensPets/${currentPet.imagemId}`, imagemData);
          } else {
            // Senão, cria uma nova imagem
            console.log('Criando nova imagem');
            imagemResponse = await axios.post('http://localhost:5000/imagensPets', imagemData);
          }
          
          // Verifica se a resposta é válida
          if (imagemResponse && imagemResponse.data && imagemResponse.data.id) {
            imagemId = imagemResponse.data.id;
            console.log(`Imagem salva com sucesso no JSON. ID: ${imagemId}`);
          } else {
            throw new Error('Resposta inválida do servidor');
          }
        } catch (imagemError) {
          console.error('Erro ao salvar imagem:', imagemError);
          console.error('Detalhes do erro:', JSON.stringify(imagemError.response?.data || {}));
          alert('Erro ao salvar imagem: ' + (imagemError.response?.data?.message || imagemError.message || 'Erro ao salvar a imagem'));
          return; // Interrompe o processo se a imagem falhar
        }
      } else if (editMode && currentPet.imagemId) {
        // Mantém a referência à imagem existente se estiver editando
        imagemId = currentPet.imagemId;
      }
      
      // Remove a imagem em base64 do objeto pet para não sobrecarregar o JSON
      delete petData.imagem;
      petData.imagemId = imagemId;
      
      // Salva o pet
      try {
        if (editMode) {
          await axios.put(`http://localhost:5000/pets/${currentPet.id}`, petData);
          console.log('Pet atualizado com sucesso');
        } else {
          await axios.post('http://localhost:5000/pets', petData);
          console.log('Pet criado com sucesso');
        }
        
        // Atualiza os dados após salvar
        await fetchImagensPets(); // Primeiro atualiza as imagens
        await fetchPets(); // Depois atualiza os pets
        handleCloseModal();
      } catch (petError) {
        console.error('Erro ao salvar pet:', petError);
        alert('Erro ao salvar pet: ' + (petError.response?.data?.message || petError.message || 'Erro desconhecido'));
        
        // Se a imagem foi salva mas o pet não, tenta remover a imagem para evitar imagens órfãs
        if (imagemId && !editMode) {
          try {
            await axios.delete(`http://localhost:5000/imagensPets/${imagemId}`);
            console.log(`Imagem ${imagemId} removida após falha ao salvar pet`);
          } catch (cleanupError) {
            console.error('Erro ao limpar imagem após falha:', cleanupError);
          }
        }
      }
    } catch (error) {
      console.error('Erro geral ao processar formulário:', error);
      alert('Erro ao processar formulário: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (pet) => {
    setCurrentPet(pet);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pet?')) {
      try {
        // Buscar o pet para verificar se tem imagem associada
        const petToDelete = pets.find(pet => pet.id === id);
        
        // Se o pet tiver uma imagem associada, exclui a imagem primeiro do JSON
        if (petToDelete && petToDelete.imagemId) {
          try {
            await axios.delete(`http://localhost:5000/imagensPets/${petToDelete.imagemId}`);
            console.log(`Imagem ${petToDelete.imagemId} excluída com sucesso do JSON`);
          } catch (imageError) {
            console.error('Erro ao excluir imagem do pet:', imageError);
          }
        }
        
        // Depois exclui o pet
        await axios.delete(`http://localhost:5000/pets/${id}`);
        fetchPets();
        fetchImagensPets(); // Atualiza a lista de imagens
      } catch (error) {
        console.error('Erro ao excluir pet:', error);
      }
    }
  };

  const handleShowModal = () => {
    setCurrentPet({
      nome: '',
      tipo: '',
      raca: '',
      idade: '',
      peso: '',
      clienteId: '',
      observacoes: ''
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

  // Função para imprimir a ficha do pet
  const handlePrintPetInfo = (pet) => {
    // Buscar informações do cliente/dono
    const cliente = clientes.find(c => c.id === pet.clienteId);
    
    // Buscar agendamentos relacionados ao pet
    const petAgendamentos = agendamentos.filter(a => a.petId === pet.id);
    
    // Buscar vendas relacionadas ao cliente (dono do pet)
    const clienteVendas = vendas.filter(v => v.clienteId === pet.clienteId);
    
    // Calcular insights
    const totalAgendamentos = petAgendamentos.length;
    const agendamentosConcluidos = petAgendamentos.filter(a => a.status === 'Concluído').length;
    const ultimoAgendamento = petAgendamentos.length > 0 ? 
      new Date(Math.max(...petAgendamentos.map(a => new Date(a.data)))) : null;
    
    // Calcular serviços mais frequentes
    const servicosFrequentes = {};
    petAgendamentos.forEach(agendamento => {
      if (!servicosFrequentes[agendamento.servicoId]) {
        servicosFrequentes[agendamento.servicoId] = 0;
      }
      servicosFrequentes[agendamento.servicoId]++;
    });
    
    // Criar uma nova janela para a impressão
    const printWindow = window.open('', '_blank');
    
    // Estilos CSS para a ficha
    const styles = `
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { text-align: center; margin-bottom: 30px; }
      .pet-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .pet-info div { flex: 1; }
      .pet-image { text-align: center; margin-bottom: 20px; }
      .pet-image img { max-width: 200px; max-height: 200px; border-radius: 10px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .section-title { margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      .insights { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
      .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
      @media print { .no-print { display: none; } }
    `;
    
    // Formatar data
    const formatarData = (data) => {
      if (!data) return 'N/A';
      return new Date(data).toLocaleDateString('pt-BR');
    };
    
    // Formatar preço
    const formatarPreco = (preco) => {
      return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    // Obter nome do serviço
    const getServicoNome = (servicoId) => {
      const servico = agendamentos.find(a => a.servicoId === servicoId);
      return servico ? servico.servicoId : 'Serviço não encontrado';
    };
    
    // Conteúdo HTML da ficha do pet
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha do Pet - ${pet.nome}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="header">
          <h1>Pet Shop</h1>
          <h2>Ficha do Pet</h2>
        </div>
        
        <div class="pet-image">
          ${pet.imagemId ? `<img src="${imagensPets.find(img => img.id === pet.imagemId)?.data}" alt="${pet.nome}">` : ''}
        </div>
        
        <div class="pet-info">
          <div>
            <h3>Informações do Pet:</h3>
            <p><strong>Nome:</strong> ${pet.nome}</p>
            <p><strong>Tipo:</strong> ${pet.tipo}</p>
            <p><strong>Raça:</strong> ${pet.raca}</p>
            <p><strong>Idade:</strong> ${pet.idade} anos</p>
            <p><strong>Peso:</strong> ${pet.peso} kg</p>
            <p><strong>Observações:</strong> ${pet.observacoes || 'Nenhuma observação'}</p>
          </div>
          <div>
            <h3>Informações do Dono:</h3>
            <p><strong>Nome:</strong> ${cliente ? cliente.nome : 'Cliente não encontrado'}</p>
            <p><strong>Email:</strong> ${cliente ? cliente.email : '-'}</p>
            <p><strong>Telefone:</strong> ${cliente ? cliente.telefone : '-'}</p>
            <p><strong>Endereço:</strong> ${cliente ? cliente.endereco : '-'}</p>
          </div>
        </div>
        
        <h3 class="section-title">Histórico de Agendamentos:</h3>
        ${petAgendamentos.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${petAgendamentos.map(agendamento => `
              <tr>
                <td>${formatarData(agendamento.data)}</td>
                <td>${getServicoNome(agendamento.servicoId)}</td>
                <td>${formatarPreco(agendamento.valor)}</td>
                <td>${agendamento.status}</td>
                <td>${agendamento.observacoes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p>Nenhum agendamento encontrado para este pet.</p>'}
        
        <div class="insights">
          <h3>Insights:</h3>
          <p><strong>Total de Visitas:</strong> ${totalAgendamentos}</p>
          <p><strong>Serviços Concluídos:</strong> ${agendamentosConcluidos}</p>
          <p><strong>Última Visita:</strong> ${ultimoAgendamento ? formatarData(ultimoAgendamento) : 'Nunca visitou'}</p>
          
          ${totalAgendamentos > 0 ? `
          <p><strong>Recomendações:</strong></p>
          <ul>
            ${ultimoAgendamento && (new Date() - new Date(ultimoAgendamento)) / (1000 * 60 * 60 * 24) > 90 ? 
              '<li>O pet está há mais de 3 meses sem visitar o pet shop. Considere agendar uma visita de rotina.</li>' : ''}
            ${pet.tipo === 'Cachorro' && !petAgendamentos.some(a => a.servicoId.toLowerCase().includes('banho') && 
              (new Date() - new Date(a.data)) / (1000 * 60 * 60 * 24) < 30) ? 
              '<li>Recomendamos um banho mensal para manter a higiene do seu cachorro.</li>' : ''}
            ${pet.tipo === 'Gato' && !petAgendamentos.some(a => a.servicoId.toLowerCase().includes('tosa') && 
              (new Date() - new Date(a.data)) / (1000 * 60 * 60 * 24) < 60) ? 
              '<li>Considere agendar uma tosa a cada 2 meses para seu gato.</li>' : ''}
          </ul>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Pet Shop - Todos os direitos reservados</p>
          <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print();" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Imprimir Ficha
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

  return (
    <Container>
      <h1 className="my-4">Gerenciamento de Pets</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nome, tipo ou raça"
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
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="d-inline-block"
            >
              <option value="">Todos os donos</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="primary" onClick={handleShowModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Novo Pet
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
                <th>Foto</th>
                <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>
                  Nome {getSortIcon('nome')}
                </th>
                <th onClick={() => handleSort('tipo')} style={{ cursor: 'pointer' }}>
                  Tipo {getSortIcon('tipo')}
                </th>
                <th onClick={() => handleSort('raca')} style={{ cursor: 'pointer' }}>
                  Raça {getSortIcon('raca')}
                </th>
                <th onClick={() => handleSort('idade')} style={{ cursor: 'pointer' }}>
                  Idade {getSortIcon('idade')}
                </th>
                <th onClick={() => handleSort('peso')} style={{ cursor: 'pointer' }}>
                  Peso (kg) {getSortIcon('peso')}
                </th>
                <th onClick={() => handleSort('dono')} style={{ cursor: 'pointer' }}>
                  Dono {getSortIcon('dono')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPets.map((pet) => (
                <tr key={pet.id}>
                  <td>{pet.id}</td>
                  <td>
                    {pet.imagemId && (
                      <img 
                        src={imagensPets.find(img => img.id === pet.imagemId)?.data} 
                        alt={pet.nome}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    )}
                  </td>
                  <td>{pet.nome}</td>
                  <td>{pet.tipo}</td>
                  <td>{pet.raca}</td>
                  <td>{pet.idade}</td>
                  <td>{pet.peso}</td>
                  <td>{getClienteNome(pet.clienteId)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(pet)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleDelete(pet.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Button variant="outline-success" size="sm" onClick={() => handlePrintPetInfo(pet)}>
                      <FontAwesomeIcon icon={faPrint} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredPets.length === 0 && (
            <p className="text-center my-3">Nenhum pet encontrado.</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal para adicionar/editar pet */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Pet' : 'Novo Pet'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={currentPet.nome}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="tipo"
                value={currentPet.tipo}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Roedor">Roedor</option>
                <option value="Réptil">Réptil</option>
                <option value="Outro">Outro</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Raça</Form.Label>
              <Form.Control
                type="text"
                name="raca"
                value={currentPet.raca}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Idade (anos)</Form.Label>
                  <Form.Control
                    type="number"
                    name="idade"
                    value={currentPet.idade}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="peso"
                    value={currentPet.peso}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Dono</Form.Label>
              <Form.Select
                name="clienteId"
                value={currentPet.clienteId}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione o dono</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observacoes"
                value={currentPet.observacoes}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Foto do Pet</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                A imagem será convertida para WebP e redimensionada para 200x200 pixels.
              </Form.Text>
              {currentPet.imagem && (
                <div className="mt-2">
                  <img 
                    src={currentPet.imagem} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    className="img-thumbnail"
                  />
                </div>
              )}
              {!currentPet.imagem && currentPet.imagemId && (
                <div className="mt-2">
                  <img 
                    src={imagensPets.find(img => img.id === currentPet.imagemId)?.data} 
                    alt="Foto do pet" 
                    style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    className="img-thumbnail"
                  />
                </div>
              )}
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

export default Pets;