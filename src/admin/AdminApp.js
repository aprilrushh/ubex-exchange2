import React from 'react';
import { Link } from 'react-router-dom';
import AdminRoutes from './routes';

const AdminApp = () => (
  <div style={{display:'flex', minHeight:'100vh'}}>
    <aside style={{width:200, background:'#222', color:'#fff', padding:24}}>
      <h2 style={{fontSize:20, marginBottom:24}}>관리자</h2>
      <nav style={{display:'flex', flexDirection:'column', gap:12}}>
        <Link to="/admin/coins" style={{color:'#fff'}}>코인 관리</Link>
        <Link to="/admin/pairs" style={{color:'#fff'}}>거래쌍 관리</Link>
      </nav>
    </aside>
    <main style={{flex:1, background:'#f8fafd', padding:32}}>
      <AdminRoutes />
    </main>
  </div>
);

export default AdminApp; 