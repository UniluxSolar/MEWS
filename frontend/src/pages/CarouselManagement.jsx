import React, { useState, useEffect } from 'react';
import API, { BASE_URL } from '../api';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import {
    FaUpload, FaTrash, FaEdit, FaImages, FaToggleOn, FaToggleOff,
    FaSave, FaTimes, FaCheckSquare, FaSquare, FaSort, FaFilter,
    FaExclamationTriangle
} from 'react-icons/fa';

const CarouselManagement = () => {
    // Data State
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PUBLISHED, DRAFT
    const [selectedIds, setSelectedIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bulkActionType, setBulkActionType] = useState(null); // 'DELETE', 'PUBLISH', 'UNPUBLISH'

    // Upload & Edit State
    const [uploading, setUploading] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [newImagePreview, setNewImagePreview] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newOrder, setNewOrder] = useState(0);
    const [newExpiryDate, setNewExpiryDate] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        filterImages();
    }, [images, filterStatus]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/carousel/all');
            setImages(data);
        } catch (error) {
            console.error("Error fetching images", error);
            // toast.error("Failed to fetch images");
        } finally {
            setLoading(false);
        }
    };

    const filterImages = () => {
        if (filterStatus === 'ALL') {
            setFilteredImages(images);
        } else if (filterStatus === 'PUBLISHED') {
            setFilteredImages(images.filter(img => img.isActive));
        } else {
            setFilteredImages(images.filter(img => !img.isActive));
        }
        // Clear selection when filter changes to avoid confusion
        setSelectedIds([]);
    };

    // Selection Logic
    const handleSelectAll = () => {
        if (selectedIds.length === filteredImages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredImages.map(img => img._id));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Bulk Actions
    const executeBulkAction = async () => {
        if (bulkActionType === 'DELETE') {
            try {
                await API.post('/carousel/bulk-delete', { ids: selectedIds });
                fetchImages();
                setSelectedIds([]);
            } catch (error) {
                console.error("Bulk delete error", error);
                alert("Failed to delete images");
            }
        } else {
            const isActive = bulkActionType === 'PUBLISH';
            try {
                await API.put('/carousel/bulk-update', { ids: selectedIds, isActive });
                fetchImages();
                setSelectedIds([]);
            } catch (error) {
                console.error("Bulk update error", error);
                alert("Failed to update status");
            }
        }
        setShowDeleteModal(false);
        setBulkActionType(null);
    };

    const confirmBulkAction = (type) => {
        if (selectedIds.length === 0) return;
        setBulkActionType(type);
        setShowDeleteModal(true);
    };

    // Single Actions
    const handleDeleteOne = (id) => {
        setSelectedIds([id]);
        confirmBulkAction('DELETE');
    };

    const handleToggleOne = async (image) => {
        try {
            await API.put(`/carousel/${image._id}`, { isActive: !image.isActive });
            fetchImages();
        } catch (error) {
            console.error("Toggle error", error);
        }
    };

    // Upload & Edit Logic (Kept mostly same but cleaner)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setNewImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newImage) return alert("Please select an image");

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', newImage);
            formData.append('title', newTitle);
            formData.append('description', newDesc);
            formData.append('order', newOrder);
            if (newExpiryDate) formData.append('expiryDate', newExpiryDate);
            formData.append('isActive', false); // Default to Draft

            await API.post('/carousel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset
            setNewImage(null);
            setNewImagePreview('');
            setNewTitle('');
            setNewDesc('');
            setNewOrder(0);
            setNewExpiryDate('');
            fetchImages();
            alert("Image uploaded as Draft!");
        } catch (error) {
            console.error("Upload error", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const startEdit = (image) => {
        setEditingId(image._id);
        setEditData({
            title: image.title,
            description: image.description,
            order: image.order,
            expiryDate: image.expiryDate ? new Date(image.expiryDate).toISOString().split('T')[0] : ''
        });
    };

    const saveEdit = async (id) => {
        try {
            await API.put(`/carousel/${id}`, editData);
            setEditingId(null);
            fetchImages();
        } catch (error) {
            console.error("Update error", error);
            alert("Failed to update image");
        }
    };

    // Helpers
    const getImageUrl = (url) => {
        return url.startsWith('http') ? url : `${BASE_URL}/${url.replace(/\\/g, '/')}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="carousel" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <FaImages className="text-blue-600" /> Carousel Manager
                                </h1>
                                <p className="text-slate-500 mt-1">Manage public landing page and login sliders.</p>
                            </div>
                        </div>

                        {/* Upload Section (Collapsible or compact) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700">
                                <FaUpload /> Upload New Slide
                            </h2>
                            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Image Input */}
                                <div className="w-full md:w-64 flex-shrink-0">
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg h-40 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden bg-slate-50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {newImagePreview ? (
                                            <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="p-4 text-slate-400">
                                                <FaImages className="text-3xl mx-auto mb-2" />
                                                <span className="text-xs font-bold">Click to Select</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                        <input
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="Slide Title"
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Order</label>
                                        <input
                                            type="number"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            value={newOrder}
                                            onChange={e => setNewOrder(e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date (Optional)</label>
                                        <input
                                            type="date"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            value={newExpiryDate}
                                            onChange={e => setNewExpiryDate(e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Banner will auto-hide after this date.</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                        <input
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="Short description (optional)"
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!newImage || uploading}
                                            className={`px-6 py-2 rounded-lg font-bold text-white text-sm transition-all shadow-sm ${!newImage || uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow'}`}
                                        >
                                            {uploading ? 'Uploading...' : 'Save as Draft'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Control Toolbar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
                            {/* Tabs */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['ALL', 'PUBLISHED', 'DRAFT'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {/* Bulk Actions */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 animate-fadeIn">
                                    <span className="text-xs font-bold text-slate-500 mr-2">{selectedIds.length} Selected</span>
                                    <button
                                        onClick={() => confirmBulkAction('PUBLISH')}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center gap-1"
                                    >
                                        <FaCheckSquare /> Publish
                                    </button>
                                    <button
                                        onClick={() => confirmBulkAction('UNPUBLISH')}
                                        className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 flex items-center gap-1"
                                    >
                                        <FaTimes /> Unpublish
                                    </button>
                                    <button
                                        onClick={() => confirmBulkAction('DELETE')}
                                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Table View */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">
                                                <button onClick={handleSelectAll} className="text-slate-400 hover:text-blue-600">
                                                    {selectedIds.length > 0 && selectedIds.length === filteredImages.length ? <FaCheckSquare /> : <FaSquare />}
                                                </button>
                                            </th>
                                            <th className="px-6 py-4">Preview</th>
                                            <th className="px-6 py-4">Details</th>
                                            <th className="px-6 py-4 text-center">Order</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading...</td>
                                            </tr>
                                        ) : filteredImages.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No images found.</td>
                                            </tr>
                                        ) : filteredImages.map(img => (
                                            <tr key={img._id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(img._id) ? 'bg-blue-50/30' : ''}`}>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleSelectOne(img._id)} className={`${selectedIds.includes(img._id) ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}>
                                                        {selectedIds.includes(img._id) ? <FaCheckSquare /> : <FaSquare />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 h-16 bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                                                        <img src={getImageUrl(img.imageUrl)} alt={img.title} className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === img._id ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                className="w-full text-xs font-bold border rounded px-2 py-1"
                                                                value={editData.title}
                                                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                                placeholder="Title"
                                                            />
                                                            <input
                                                                className="w-full text-xs border rounded px-2 py-1"
                                                                value={editData.description}
                                                                onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                                placeholder="Description"
                                                            />
                                                            <input
                                                                type="date"
                                                                className="w-full text-xs border rounded px-2 py-1"
                                                                value={editData.expiryDate}
                                                                onChange={e => setEditData({ ...editData, expiryDate: e.target.value })}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="font-bold text-slate-800">{img.title || "Untitled"}</div>
                                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{img.description}</div>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[10px] text-slate-400">Created: {new Date(img.createdAt).toLocaleDateString()}</span>
                                                                {img.expiryDate && (
                                                                    <span className={`text-[10px] font-bold ${new Date(img.expiryDate) < new Date() ? 'text-red-500' : 'text-amber-500'}`}>
                                                                        Expires: {new Date(img.expiryDate).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {editingId === img._id ? (
                                                        <input
                                                            type="number"
                                                            className="w-16 text-center text-xs font-bold border rounded px-2 py-1"
                                                            value={editData.order}
                                                            onChange={e => setEditData({ ...editData, order: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="font-mono font-bold text-slate-500">{img.order}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleOne(img)}
                                                        className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide transition-all border ${img.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                                    >
                                                        {img.isActive ? 'Published' : 'Draft'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {editingId === img._id ? (
                                                            <>
                                                                <button onClick={() => saveEdit(img._id)} className="text-emerald-600 hover:text-emerald-700 p-1.5 bg-emerald-50 rounded-lg"><FaSave /></button>
                                                                <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700 p-1.5 bg-slate-100 rounded-lg"><FaTimes /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => startEdit(img)} className="text-blue-600 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                                                                <button onClick={() => handleDeleteOne(img._id)} className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-zoomIn">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-xl">
                            <FaExclamationTriangle />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                            {bulkActionType === 'DELETE' ? 'Delete Images?' : bulkActionType === 'PUBLISH' ? 'Publish Images?' : 'Unpublish Images?'}
                        </h3>
                        <p className="text-center text-slate-500 mb-6 text-sm">
                            {bulkActionType === 'DELETE'
                                ? `Are you sure you want to permanently delete ${selectedIds.length} image(s)? This action cannot be undone.`
                                : `Are you sure you want to ${bulkActionType.toLowerCase()} ${selectedIds.length} image(s)?`
                            }
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeBulkAction}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors shadow-lg ${bulkActionType === 'DELETE' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                                    bulkActionType === 'PUBLISH' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                                        'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarouselManagement;
