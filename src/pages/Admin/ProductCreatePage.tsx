import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductService, categoryService, Category } from '../../services/admin.service';
import { LoadingState } from '../../components/common/LoadingState';

const generateSku = () => `HB-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const initialForm = {
  sku: generateSku(), name: '', shortDescription: '', fullDescription: '', sareeType: '', occasions: '', collections: '',
  fabric: '', weave: '', workType: '', colour: '', pattern: '', zariDetails: '', workIntensity: 'medium',
  sareeLength: '', sareeWidth: '', weightGrams: '0', costPrice: '', sellingPrice: '', discountPrice: '0',
  availableQuantity: '0', lowStockThreshold: '3', status: 'published', videoUrl: '', tags: '',
  certificationInfo: '', weaverInfo: '', careInstructions: '', dispatchTime: '2-4 business days', isNewArrival: false,
};

export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Record<Category['type'], Category[]>>({ saree_type: [], occasion: [], collection: [] });
  const [categoryModal, setCategoryModal] = useState<Category['type'] | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const requiredFields = new Set(['sku', 'name', 'sareeType', 'costPrice', 'sellingPrice']);

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (value.trim()) setFieldErrors((current) => ({ ...current, [field]: '' }));
  };

  useEffect(() => {
    Promise.all((['saree_type', 'occasion', 'collection'] as Category['type'][]).map(async (type) => [type, await categoryService.list(type)] as const))
      .then((entries) => setCategories(Object.fromEntries(entries) as Record<Category['type'], Category[]>))
      .catch(() => setError('Could not load product categories.'));
  }, []);

  const addCategory = async () => {
    if (!categoryModal || !newCategoryName.trim()) return;
    setCategoryError('');
    try {
      const category = await categoryService.create({ name: newCategoryName.trim(), type: categoryModal });
      setCategories((current) => ({ ...current, [categoryModal]: [...current[categoryModal], category] }));
      if (categoryModal === 'saree_type') update('sareeType', category.name);
      if (categoryModal === 'occasion') update('occasions', `${form.occasions ? `${form.occasions}, ` : ''}${category.name}`);
      if (categoryModal === 'collection') update('collections', `${form.collections ? `${form.collections}, ` : ''}${category.name}`);
      setNewCategoryName('');
      setCategoryModal(null);
    } catch (err: any) {
      setCategoryError(err?.response?.data?.message || 'Could not create category.');
    }
  };

  const categoryField = (type: Category['type'], field: 'sareeType' | 'occasions' | 'collections', label: string, multiple = false) => (
    <div className="category-field">
      <label htmlFor={field}>{label}{requiredFields.has(field) && <span className="required-mark"> *</span>}</label>
      <div className="category-field__control">
        {multiple ? (
          <select id={field} multiple value={form[field] ? form[field].split(',').map((value) => value.trim()).filter(Boolean) : []}
            onChange={(event) => update(field, Array.from(event.target.selectedOptions).map((option) => option.value).join(', '))}>
            {categories[type].map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
          </select>
        ) : (
          <select id={field} aria-invalid={Boolean(fieldErrors[field])} value={form[field]} onChange={(event) => update(field, event.target.value)}>
            <option value="">Select {label.toLowerCase()}</option>
            {categories[type].map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
          </select>
        )}
        <button className="category-field__add" type="button" aria-label={`Add ${label}`} onClick={() => { setCategoryModal(type); setCategoryError(''); }}>+</button>
      </div>
      {multiple && <small>Hold Ctrl/Cmd to select multiple</small>}
      {fieldErrors[field] && <p className="field-error">{fieldErrors[field]}</p>}
    </div>
  );

  const validate = () => {
    const errors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!String(form[field as keyof typeof initialForm]).trim()) errors[field] = 'This field is required.';
    });
    ['costPrice', 'sellingPrice'].forEach((field) => {
      if (form[field].trim() && Number(form[field]) <= 0) errors[field] = 'Enter an amount greater than 0.';
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const imagePaths = await Promise.all(files.map((file) => adminProductService.uploadImage(file)));
      await adminProductService.create({
        ...form,
        occasions: form.occasions.split(',').map((value) => value.trim()).filter(Boolean),
        collections: form.collections.split(',').map((value) => value.trim()).filter(Boolean),
        tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean),
        costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice),
        discountPrice: Number(form.discountPrice), availableQuantity: Number(form.availableQuantity),
        lowStockThreshold: Number(form.lowStockThreshold), weightGrams: Number(form.weightGrams),
        imagePaths,
      });
      navigate('/admin/inventory');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not create this product.');
    } finally {
      setSaving(false);
    }
  };

  const fields: [keyof typeof initialForm, string][] = [
    ['sku', 'SKU'], ['name', 'Product name'],
    ['fabric', 'Fabric'], ['weave', 'Weave'], ['workType', 'Work type'], ['colour', 'Colour'],
    ['pattern', 'Pattern'], ['zariDetails', 'Zari details'], ['sareeLength', 'Saree length'],
    ['sareeWidth', 'Saree width'], ['costPrice', 'Cost price'], ['sellingPrice', 'Selling price'],
    ['discountPrice', 'Discount price'], ['availableQuantity', 'Available quantity'],
    ['lowStockThreshold', 'Low-stock threshold'], ['weightGrams', 'Weight in grams'],
    ['dispatchTime', 'Dispatch time'], ['videoUrl', 'Video URL'], ['tags', 'Tags (comma separated)'],
    ['certificationInfo', 'Certification'], ['weaverInfo', 'Weaver information'], ['careInstructions', 'Care instructions'],
  ];

  return (
    <form className="admin-page product-form" onSubmit={handleSubmit}>
      <h2>Add saree</h2>
      <p>Category fields use existing category names. Images upload directly to Azure Blob before the product is saved.</p>
      <div className="product-form__grid">
        {fields.map(([field, label]) => (
          <label key={field} htmlFor={field}>{label}{requiredFields.has(field) && <span className="required-mark"> *</span>}
            <input id={field} disabled={field === 'sku'} aria-invalid={Boolean(fieldErrors[field])} value={String(form[field])}
              onChange={(event) => update(field, event.target.value)} />
            {fieldErrors[field] && <p className="field-error">{fieldErrors[field]}</p>}
          </label>
        ))}
        {categoryField('saree_type', 'sareeType', 'Saree type')}
        {categoryField('occasion', 'occasions', 'Occasions', true)}
        {categoryField('collection', 'collections', 'Collections', true)}
        <label>Work intensity
          <select value={form.workIntensity} onChange={(event) => update('workIntensity', event.target.value)}>
            <option value="light">Light</option><option value="medium">Medium</option><option value="heavy">Heavy</option>
          </select>
        </label>
        <label className="product-form__checkbox">
          <input type="checkbox" checked={form.isNewArrival} onChange={(event) => setForm((current) => ({ ...current, isNewArrival: event.target.checked }))} />
          Mark as New Arrival
        </label>
        <label>Status
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="published">Published</option><option value="draft">Draft</option>
          </select>
        </label>
        <label className="product-form__wide">Short description
          <textarea value={form.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} />
        </label>
        <label className="product-form__wide">Full description
          <textarea value={form.fullDescription} onChange={(event) => update('fullDescription', event.target.value)} />
        </label>
        <label className="product-form__wide">Product images
          <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
          <small>{files.length} image(s) selected</small>
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" disabled={saving} type="submit">
        {saving ? <LoadingState label="Uploading and saving" variant="inline" /> : 'Create saree'}
      </button>
      {categoryModal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setCategoryModal(null)}>
          <div className="category-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="category-modal__close" type="button" onClick={() => setCategoryModal(null)} aria-label="Close">×</button>
            <h3>Add {categoryModal.replace('_', ' ')} category</h3>
            <div className="category-modal__form">
              <label>Category name
                <input autoFocus required value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} />
              </label>
              {categoryError && <p className="error">{categoryError}</p>}
              <button className="btn btn--primary" type="button" onClick={addCategory}>Add category</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
