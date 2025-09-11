import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Генерация номеров страниц
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    // Если страниц 3 или меньше, показываем все
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Определяем диапазон страниц
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    // Корректируем, если страниц меньше
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="pagination"
      >
        &lt;&lt;
      </button>
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`pagination ${pageNum === currentPage ? "active" : ""}`}
        >
          {pageNum}
        </button>
      ))}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="pagination"
      >
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;