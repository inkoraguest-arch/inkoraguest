import { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { ProductCard } from '../components/ProductCard';
import { Loader, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import './StoreArtist.css';

const MOCK_PRODUCTS = [];

export function StoreArtist() {
    const { profile } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Product Modal State
    const [isAdding, setIsAdding] = useState(false);
    const [addingLoading, setAddingLoading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        description: '',
        image_url: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    id,
                    title,
                    price,
                    image_url,
                    profiles:seller_id (full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                const mappedProducts = data.map(prod => ({
                    id: prod.id,
                    title: prod.title,
                    seller: prod.profiles?.full_name || 'Artista',
                    price: `R$ ${prod.price}`,
                    image: prod.image_url || null,
                }));
                setProducts(mappedProducts);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!profile) return;

        setAddingLoading(true);
        try {
            const { error } = await supabase
                .from('products')
                .insert([
                    {
                        seller_id: profile.id,
                        title: newProduct.title,
                        description: newProduct.description,
                        price: parseFloat(newProduct.price) || 0,
                        image_url: newProduct.image_url || null
                    }
                ]);

            if (error) throw error;

            // Success
            setIsAdding(false);
            setNewProduct({ title: '', price: '', description: '', image_url: '' });
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Erro ao cadastrar produto.');
        } finally {
            setAddingLoading(false);
        }
    };

    return (
        <div className="store-page">
            <TopBar />

            <div className="store-header">
                <h2 className="section-title">Loja / Marketplace</h2>
                <p className="store-subtitle">Venda seus flashes exclusivos, prints e produtos para clientes e outros artistas.</p>

                <button className="add-product-btn" onClick={() => setIsAdding(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Anunciar Produto
                </button>
            </div>

            {isAdding && (
                <div className="add-product-modal">
                    <div className="add-product-content">
                        <button className="close-modal-btn" onClick={() => setIsAdding(false)}>
                            <X size={24} />
                        </button>
                        <h3>Novo Produto / Flash</h3>
                        <form onSubmit={handleAddProduct}>
                            <div className="input-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Print A3 Rosa Caveira"
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Preço (R$)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="Ex: 150.00"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>URL da Imagem</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newProduct.image_url}
                                    onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Descrição</label>
                                <textarea
                                    rows="3"
                                    placeholder="Detalhes do produto ou flash..."
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>
                            <button className="submit-product-btn" type="submit" disabled={addingLoading}>
                                {addingLoading ? 'Salvando...' : 'Salvar Produto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="products-grid">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                        <Loader className="spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    products.map(prod => (
                        <ProductCard key={prod.id} product={prod} />
                    ))
                )}
            </div>
        </div>
    );
}
