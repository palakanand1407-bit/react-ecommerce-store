// src/pages/ProductList.jsx
import React, { useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import useFetch from "../hooks/useFetch";
import { fetchProducts, fetchCategories } from "../services/api";
import "./ProductList.css";

function ProductList() {
  const [category, setCategory] = useState("");
  const [sort,     setSort]     = useState("");
  const [search,   setSearch]   = useState("");

  const { data: pData, loading, error } = useFetch(() => fetchProducts({ category, sort }), [category, sort]);
  const { data: cData } = useFetch(() => fetchCategories(), []);

  const products = useMemo(() => {
    const list = pData?.data?.products || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  }, [pData, search]);

  const categories = cData?.data?.categories || [];

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">New Collection 2025</p>
          <h1 className="hero-title">Crafted choices<br /><em>timeless value.</em></h1>
          <p className="hero-sub">A carefully curated archive of goods — chosen for quality, craft, and longevity.</p>
        </div>
      </section>

      <div className="page-wrapper">
        <div className="controls-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" type="search" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="category-bar">
          <button className={`cat-pill ${category===""?"cat-pill--active":""}`} onClick={() => setCategory("")}>All</button>
          {categories.map(c => (
            <button key={c} className={`cat-pill ${category===c?"cat-pill--active":""}`} onClick={() => setCategory(c)}>
              {c.charAt(0).toUpperCase()+c.slice(1)}
            </button>
          ))}
        </div>

        {loading && <div className="spinner-wrapper"><div className="spinner-ring" /></div>}
        {error   && <div className="error-box">{error}</div>}

        {!loading && !error && (
          <>
            <div className="results-count">{products.length} product{products.length!==1?"s":""}</div>
            {products.length === 0
              ? <div className="no-results"><p>No products found.</p><button className="btn-secondary" onClick={() => { setSearch(""); setCategory(""); }}>Clear filters</button></div>
              : <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
            }
          </>
        )}
      </div>
    </div>
  );
}

export default ProductList;
