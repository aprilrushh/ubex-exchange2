import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CoinListPage from '../../src/admin/pages/CoinListPage';
import CoinEditPage from '../../src/admin/pages/CoinEditPage';
import * as AdminService from '../../src/admin/services/AdminService';

jest.mock('../../src/admin/services/AdminService');

describe('Admin coin pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('CoinListPage shows coins and toggles status', async () => {
    AdminService.listCoins.mockResolvedValue([
      { id: 1, symbol: 'BTC', name: 'Bitcoin', decimals: 8, active: true }
    ]);
    AdminService.saveCoin.mockResolvedValue({});

    render(
      <MemoryRouter>
        <CoinListPage />
      </MemoryRouter>
    );

    const toggleBtn = await screen.findByText('활성');
    fireEvent.click(toggleBtn);

    expect(AdminService.saveCoin).toHaveBeenCalledWith({
      id: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 8,
      active: false
    });
  });

  test('CoinEditPage can create new coin', async () => {
    AdminService.saveCoin.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<CoinEditPage />} />
        </Routes>
      </MemoryRouter>
    );

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'ETH' } });
    fireEvent.change(inputs[1], { target: { value: 'Ethereum' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '8' } });
    fireEvent.click(screen.getByText('저장'));

    expect(AdminService.saveCoin).toHaveBeenCalledWith({
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 8,
      id: undefined
    });
  });

  test('CoinEditPage can edit coin', async () => {
    AdminService.getCoin.mockResolvedValue({
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 8
    });
    AdminService.saveCoin.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={["/1"]}>
        <Routes>
          <Route path="/:id" element={<CoinEditPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByDisplayValue('BTC');
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'BitcoinX' }
    });
    fireEvent.click(screen.getByText('저장'));

    expect(AdminService.saveCoin).toHaveBeenCalledWith({
      id: '1',
      symbol: 'BTC',
      name: 'BitcoinX',
      decimals: 8
    });
  });
});
