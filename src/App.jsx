import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [loads, setLoads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('Cignal');
  
  // STATES PARA SA SEARCH
  const [searchTerm, setSearchTerm] = useState(''); // Para sa Directory List
  const [searchLoad, setSearchLoad] = useState(''); // BAGONG STATE para sa Tracker History List
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const today = new Date().toISOString().split('T')[0];
  const [customerForm, setCustomerForm] = useState({ name: '', acc_num: '', category: 'Cignal' });
  const [loadForm, setLoadForm] = useState({ date: today, category: 'Cignal', name: '', acc_num: '', price: '', status: 'Not Paid' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingLoad, setEditingLoad] = useState(null);

  const API_BASE = "http://127.0.0.1:5000/api";

  const fetchCustomers = (page = 1, search = '') => {
    axios.get(`${API_BASE}/customers`, { params: { page: page, search: search } })
      .then(res => {
        const data = res.data.customers || res.data;
        setCustomers(Array.isArray(data) ? data : []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(page);
      })
      .catch(err => console.error("API Error:", err));
  };

  const fetchLoads = () => {
    axios.get(`${API_BASE}/loads`).then(res => setLoads(res.data || [])).catch(err => console.error(err));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => { 
      fetchCustomers(1, searchTerm); 
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => { 
    fetchLoads(); 
  }, []);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const req = editingCustomer ? axios.put(`${API_BASE}/customers/${editingCustomer.id}`, customerForm) : axios.post(`${API_BASE}/customers`, customerForm);
    req.then(() => { 
      setEditingCustomer(null); 
      setCustomerForm({name:'', acc_num:'', category:'Cignal'}); 
      fetchCustomers(currentPage, searchTerm); 
    });
  };

  const handleDeleteCustomer = (id) => { 
    if(window.confirm("Delete this user?")) {
      axios.delete(`${API_BASE}/customers/${id}`).then(() => fetchCustomers(currentPage, searchTerm)); 
    }
  };

  const handleAddLoad = (e) => {
    e.preventDefault();
    const req = editingLoad ? axios.put(`${API_BASE}/loads/${editingLoad.id}`, loadForm) : axios.post(`${API_BASE}/loads`, loadForm);
    req.then(() => { 
      alert("Transaction Saved!"); 
      setEditingLoad(null);
      setLoadForm({ date: today, category: 'Cignal', name: '', acc_num: '', price: '', status: 'Not Paid' });
      fetchLoads(); 
    });
  };

  const handleDeleteLoad = (id) => {
    if(window.confirm("Remove this transaction?")) {
      axios.delete(`${API_BASE}/loads/${id}`).then(() => fetchLoads());
    }
  };

  const renderRegister = () => (
    <div style={styles.responsiveRow}>
      <div style={{...styles.glassCard, flex: '1 1 300px'}}>
        <h2 style={styles.sectionTitle}>{editingCustomer ? 'Update' : 'Register'} User</h2>
        <form onSubmit={handleAddCustomer} style={styles.verticalForm}>
          <input placeholder="Name" value={customerForm.name} onChange={e=>setCustomerForm({...customerForm, name: e.target.value})} style={styles.input} required />
          <input placeholder="Account #" value={customerForm.acc_num} onChange={e=>setCustomerForm({...customerForm, acc_num: e.target.value})} style={styles.input} required />
          <select value={customerForm.category} onChange={e=>setCustomerForm({...customerForm, category: e.target.value})} style={styles.input}>
            <option value="Cignal">Cignal</option>
            <option value="GSAT">GSAT</option>
          </select>
          <button type="submit" style={styles.addButton}>{editingCustomer ? 'UPDATE USER' : 'SAVE USER'}</button>
          {editingCustomer && <button type="button" onClick={() => {setEditingCustomer(null); setCustomerForm({name:'', acc_num:'', category:'Cignal'})}} style={styles.cancelBtn}>CANCEL</button>}
        </form>
      </div>
      <div style={{...styles.glassCard, flex: '2 1 400px'}}>
        <div style={styles.headerFlex}>
          <h2 style={styles.sectionTitle}>Directory List</h2>
          <input placeholder="🔍 Search user..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
        <div style={styles.scrollContainer}>
          <table style={styles.table}>
            <thead><tr style={styles.tableHeader}><th>NAME</th><th>ACC NUM</th><th>BRAND</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {customers.length > 0 ? customers.map(c => (
                <tr key={c.id} style={styles.tableRow}>
                  <td style={styles.td}>{c.name}</td><td style={styles.td}>{c.acc_num}</td>
                  <td style={{...styles.td, color: c.category === 'Cignal' ? '#FFC107' : '#03A9F4'}}>{c.category}</td>
                  <td style={styles.td}>
                    <button onClick={()=>{setEditingCustomer(c); setCustomerForm(c); window.scrollTo(0,0)}} style={styles.editBtn}>EDIT</button>
                    <button onClick={()=>handleDeleteCustomer(c.id)} style={styles.deleteBtn}>DEL</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#64748B'}}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={styles.pagination}>
          <button disabled={currentPage === 1} onClick={()=>fetchCustomers(currentPage-1, searchTerm)} style={styles.pageBtn}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={()=>fetchCustomers(currentPage+1, searchTerm)} style={styles.pageBtn}>Next</button>
        </div>
      </div>
    </div>
  );

  const renderTracker = () => (
    <div style={styles.glassCard}>
      <h2 style={styles.sectionTitle}>{editingLoad ? 'Update' : 'New'} Transaction</h2>
      <form onSubmit={handleAddLoad} style={styles.trackerFormGrid}>
        <input type="date" value={loadForm.date} onChange={e=>setLoadForm({...loadForm, date: e.target.value})} style={styles.input} required />
        <select value={loadForm.category} onChange={e=>setLoadForm({...loadForm, category: e.target.value})} style={styles.input}>
          <option value="Cignal">Cignal</option>
          <option value="GSAT">GSAT</option>
        </select>
        
        {/* Pinalitan ang placeholder para malinaw na form input ito, hindi search filter */}
        <input list="cust-list" placeholder="Select customer..." value={loadForm.name} onChange={e => {
          const s = customers.find(c => c.name === e.target.value);
          if(s) setLoadForm({...loadForm, name: s.name, acc_num: s.acc_num, category: s.category});
          else setLoadForm({...loadForm, name: e.target.value});
        }} style={styles.input} required />
        <datalist id="cust-list">{customers.map(c => <option key={c.id} value={c.name}/>)}</datalist>

        <input placeholder="Account #" value={loadForm.acc_num} onChange={e=>setLoadForm({...loadForm, acc_num: e.target.value})} style={styles.input} required />
        <input placeholder="Price" type="number" value={loadForm.price} onChange={e=>setLoadForm({...loadForm, price: e.target.value})} style={styles.input} required />
        <select value={loadForm.status} onChange={e=>setLoadForm({...loadForm, status: e.target.value})} style={styles.input}>
          <option value="Paid">Paid</option>
          <option value="Not Paid">Not Paid</option>
        </select>
        <button type="submit" style={styles.addButton}>{editingLoad ? 'UPDATE' : 'RECORD'}</button>
      </form>

      {/* ETO YUNG BAGONG LAYOUT BASE SA RED BOX SA SCREENSHOT MO */}
      <div style={styles.tabHeaderContainer}>
        <div style={styles.tabGroup}>
          <button onClick={()=>setActiveTab('Cignal')} style={activeTab === 'Cignal' ? styles.activeTab : styles.inactiveTab}>Cignal History</button>
          <button onClick={()=>setActiveTab('GSAT')} style={activeTab === 'GSAT' ? styles.activeTab : styles.inactiveTab}>GSAT History</button>
        </div>
        
        {/* BAGONG SEARCH BAR PARA SA TRANSACTION LIST */}
        <input 
          placeholder="🔍 Search history..." 
          value={searchLoad} 
          onChange={e => setSearchLoad(e.target.value)} 
          style={styles.searchInput} 
        />
      </div>

      <div style={{overflowX: 'auto'}}>
        <table style={styles.table}>
          <thead><tr style={styles.tableHeader}><th>DATE</th><th>NAME</th><th>ACC NUM</th><th>PRICE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {/* INAPPLY ANG SEARCH FILTER SA LOADS LIST */}
            {loads
              .filter(l => l.category === activeTab && (l.name.toLowerCase().includes(searchLoad.toLowerCase()) || l.acc_num.includes(searchLoad)))
              .map(l => (
              <tr key={l.id} style={styles.tableRow}>
                <td style={styles.td}>{l.date}</td>
                <td style={styles.td}>{l.name}</td>
                <td style={styles.td}>{l.acc_num}</td>
                <td style={{...styles.td, color: '#FFC107'}}>₱{l.price}</td>
                <td style={{...styles.td, color: l.status === 'Paid' ? '#4CAF50' : '#F44336'}}>{l.status}</td>
                <td style={styles.td}>
                  <button onClick={()=>{setEditingLoad(l); setLoadForm(l); window.scrollTo(0,0)}} style={styles.editBtn}>EDIT</button>
                  <button onClick={()=>handleDeleteLoad(l.id)} style={styles.deleteBtn}>DEL</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>SATELLITE MASTER</h1>
        <button onClick={()=>setActivePage('dashboard')} style={activePage==='dashboard'?styles.navBtnActive:styles.navBtn}>📊 Dashboard</button>
        <button onClick={()=>setActivePage('register')} style={activePage==='register'?styles.navBtnActive:styles.navBtn}>👤 Directory</button>
        <button onClick={()=>setActivePage('tracker')} style={activePage==='tracker'?styles.navBtnActive:styles.navBtn}>🛰️ Tracker</button>
      </div>
      <div style={styles.main}>
        {activePage === 'dashboard' && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}><h3>{customers.length}</h3><p>Customers Found</p></div>
            <div style={styles.statCard}><h3>₱{loads.reduce((a,b)=>a+b.price,0)}</h3><p>Total Revenue</p></div>
          </div>
        )}
        {activePage === 'register' && renderRegister()}
        {activePage === 'tracker' && renderTracker()}
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#0A0F1E', color: 'white', fontFamily: 'sans-serif' },
  sidebar: { width: '200px', backgroundColor: '#161B2D', borderRight: '1px solid #23293F', padding: '30px 15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  logo: { fontSize: '18px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center', color: '#FFC107' },
  main: { flex: 1, padding: '40px' },
  navBtn: { padding: '12px', textAlign: 'left', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', borderRadius: '8px' },
  navBtnActive: { padding: '12px', textAlign: 'left', backgroundColor: '#FFC107', color: '#0F172A', fontWeight: 'bold', borderRadius: '8px' },
  glassCard: { backgroundColor: '#161B2D', borderRadius: '12px', padding: '20px', border: '1px solid #23293F', marginBottom: '20px' },
  responsiveRow: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  headerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontSize: '20px', fontWeight: 'bold' },
  verticalForm: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' },
  trackerFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' },
  input: { backgroundColor: '#0F172A', border: '1px solid #2D3748', borderRadius: '6px', padding: '10px', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' },
  searchInput: { backgroundColor: '#0A0F1E', border: '1px solid #FFC107', borderRadius: '20px', padding: '8px 15px', color: 'white', fontSize: '12px', width: '200px', outline: 'none' },
  addButton: { backgroundColor: '#FFC107', color: '#0F172A', padding: '10px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%' },
  cancelBtn: { backgroundColor: '#374151', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', marginTop: '5px' },
  editBtn: { color: '#FFC107', border: '1px solid #FFC107', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', marginRight: '5px' },
  deleteBtn: { color: '#F44336', border: '1px solid #F44336', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' },
  pageBtn: { padding: '5px 15px', cursor: 'pointer', backgroundColor: '#1F2937', color: 'white', border: '1px solid #374151', borderRadius: '4px' },
  
  // BAGONG CONTAINER PARA SA TABS AT SEARCH BAR
  tabHeaderContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2D3748', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  tabGroup: { display: 'flex', gap: '15px' },
  
  activeTab: { color: '#FFC107', borderBottom: '2px solid #FFC107', padding: '8px', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold' },
  inactiveTab: { color: '#64748B', padding: '8px', cursor: 'pointer', background: 'none', border: 'none' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  tableHeader: { textAlign: 'left', color: '#64748B', fontSize: '12px' },
  tableRow: { borderBottom: '1px solid rgba(45, 55, 72, 0.4)' },
  td: { padding: '12px 10px', fontSize: '13px', whiteSpace: 'nowrap' },
  scrollContainer: { maxHeight: '400px', overflowY: 'auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  statCard: { backgroundColor: '#1F2937', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #374151' }
};

export default App;