import React, { useState, useEffect } from "react";
import styles from "./Pricing.module.css";
import axios from "axios";

const SubscriptionPlansAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_type: "",
    title: "",
    description: "",
    price: "",
    original_price: "",
    show_original_price: false,
    duration_days: "",
    most_popular: false,
    is_free_trial: false,
    display_order: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        "http://61.246.67.74:4000/api/admin/subscription-plans-all"
      );
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      alert("Failed to fetch plans");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const response = await axios.put(
          `http://localhost:4000/api/subscription-plans/${editingPlan.id}`,
          formData
        );
        if (response.data.success) {
          alert("Plan updated successfully");
        }
      } else {
        const response = await axios.post(
          "http://localhost:4000/api/subscription-plans",
          formData
        );
        if (response.data.success) {
          alert("Plan added successfully");
        }
      }
      fetchPlans();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_type: plan.plan_type,
      title: plan.title,
      description: plan.description,
      price: plan.price,
      original_price: plan.original_price || "",
      show_original_price: plan.show_original_price,
      duration_days: plan.duration_days,
      most_popular: plan.most_popular,
      is_free_trial: plan.is_free_trial,
      display_order: plan.display_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        const response = await axios.delete(
          `http://localhost:4000/api/subscription-plans/${id}`
        );
        if (response.data.success) {
          alert("Plan deleted successfully");
          fetchPlans();
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Failed to delete plan");
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/subscription-plans/${id}/toggle-active`
      );
      if (response.data.success) {
        fetchPlans();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to toggle status");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      plan_type: "",
      title: "",
      description: "",
      price: "",
      original_price: "",
      show_original_price: false,
      duration_days: "",
      most_popular: false,
      is_free_trial: false,
      display_order: "",
    });
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setFormData({
      plan_type: "",
      title: "",
      description: "",
      price: "",
      original_price: "",
      show_original_price: false,
      duration_days: "",
      most_popular: false,
      is_free_trial: false,
      display_order: "",
    });
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Subscription Plans</h2>
        <button className={styles.addButton} onClick={handleAddNew}>
          Add New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No subscription plans found. Add your first plan!</p>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard} onClick={() => handleEdit(plan)}>
              <div className={styles.planContent}>
                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Order</span>
                  <span className={styles.fieldValue}>
                    {plan.display_order}
                  </span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Title</span>
                  <span className={styles.fieldValue}>{plan.title}</span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Type</span>
                  <span className={styles.fieldValue}>{plan.plan_type}</span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Duration</span>
                  <span className={styles.fieldValue}>
                    {plan.duration_days} days
                  </span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Price</span>
                  <span className={styles.fieldValue}>₹{plan.price}</span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Original Price</span>
                  <span className={styles.fieldValue}>
                    {plan.original_price ? `₹${plan.original_price}` : "-"}
                  </span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Status</span>
                  <span
                    className={`${styles.badge} ${
                      plan.is_active ? styles.active : styles.inactive
                    }`}
                  >
                    {plan.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className={styles.planField}>
                  <span className={styles.fieldLabel}>Tags</span>
                  <div
                    style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                  >
                    {plan.most_popular && (
                      <span className={`${styles.badge} ${styles.popular}`}>
                        Popular
                      </span>
                    )}
                    {plan.is_free_trial && (
                      <span className={`${styles.badge} ${styles.freeTrial}`}>
                        Free Trial
                      </span>
                    )}
                    {!plan.most_popular && !plan.is_free_trial && "-"}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => handleEdit(plan)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.actionButton} ${
                    plan.is_active
                      ? styles.toggleButton
                      : styles.toggleButtonActive
                  }`}
                  onClick={() => handleToggleActive(plan.id)}
                >
                  {plan.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(plan.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plan Type</label>
                  <input
                    type="text"
                    name="plan_type"
                    className={styles.formInput}
                    value={formData.plan_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Free, Quarterly, Yearly"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title</label>
                  <input
                    type="text"
                    name="title"
                    className={styles.formInput}
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Free Trial"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <input
                    type="text"
                    name="description"
                    className={styles.formInput}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., For 14 Days"
                    required
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div className={styles.formGroup} style={{ width: "45%" }}>
                    <label className={styles.formLabel}>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      className={styles.formInput}
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{ width: "45%" }}>
                    <label className={styles.formLabel}>
                      Original Price (₹) - Optional
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="original_price"
                      className={styles.formInput}
                      value={formData.original_price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                <div className={styles.formGroup} style={{ width: '45%' }}>
                  <label className={styles.formLabel}>Duration (Days)</label>
                  <input
                    type="number"
                    name="duration_days"
                    className={styles.formInput}
                    value={formData.duration_days}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ width: '45%' }}>
                  <label className={styles.formLabel}>Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    className={styles.formInput}
                    value={formData.display_order}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                </div>
<div className={styles.checkboxGroupcontainer}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="show_original_price"
                    name="show_original_price"
                    checked={formData.show_original_price}
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="show_original_price"
                    className={styles.checkboxLabel}
                  >
                    Show Original Price (strikethrough)
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="most_popular"
                    name="most_popular"
                    checked={formData.most_popular}
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="most_popular"
                    className={styles.checkboxLabel}
                  >
                    Mark as Most Popular
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="is_free_trial"
                    name="is_free_trial"
                    checked={formData.is_free_trial}
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="is_free_trial"
                    className={styles.checkboxLabel}
                  >
                    Free Trial Plan
                  </label>
                </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingPlan ? "Update Plan" : "Add Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansAdmin;
