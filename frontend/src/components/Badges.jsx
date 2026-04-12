import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    'in route': 'bg-primary-50 text-primary-700 border-primary-200',
    'in-transit': 'bg-primary-50 text-primary-700 border-primary-200', // alias for in route
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels = {
    pending: 'Pendiente',
    assigned: 'Asignado',
    'in route': 'En Ruta',
    'in-transit': 'En Ruta',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-blue-100 text-blue-600 border-blue-200',
    high: 'bg-red-100 text-red-600 border-red-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
};

export { StatusBadge, PriorityBadge };
