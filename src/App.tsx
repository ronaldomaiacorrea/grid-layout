import { useEffect, useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import "./App.css"

interface GridLayoutItem {
  id: number;
  featured: boolean;
  position: number;
}

// Generate a larger dataset for pagination
const generateCardData = (count: number) => {
  const data = []
  const topics = [
    "Architecture",
    "Design",
    "Color Theory",
    "Minimalism",
    "Typography",
    "Visual Storytelling",
    "Responsive Design",
    "UX Research",
    "Graphic Design",
    "Web Development",
    "UI Patterns",
    "Accessibility",
    "Animation",
    "Branding",
    "Content Strategy",
    "Design Systems",
  ]

  for (let i = 1; i <= count; i++) {
    const topicIndex = (i - 1) % topics.length
    const monthOffset = Math.floor(i / 4)
    const dayOffset = (i % 28) + 1

    const date = new Date()
    date.setMonth(date.getMonth() - monthOffset)
    date.setDate(dayOffset)

    const formattedDate = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

    data.push({
      id: i,
      title: `${topics[topicIndex]} Principles ${i}`,
      date: formattedDate,
      image: `/placeholder.svg?height=400&width=600&text=Image+${i}`,
    })
  }

  return data
}

// Generate 100 cards for our dataset to accommodate larger page sizes
const allCardData = generateCardData(100)

// Available page size options
const pageSizeOptions = [10, 25, 50]

export function App() {
  const [cardAssignments, setCardAssignments] = useState<Record<string, GridLayoutItem[]>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10) // Default page size
  const [isLoading, setIsLoading] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)

  // Calculate total pages based on current page size
  const totalPages = Math.ceil(allCardData.length / pageSize)

  // Function to get cards for the current page
  const getCurrentPageCards = (page: number, size: number) => {
    const startIndex = (page - 1) * size
    return allCardData.slice(startIndex, startIndex + size)
  }

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Determine number of columns based on screen size
  const getGridColumns = () => {
    if (windowWidth >= 1024) return 3 // Large screens - 3 columns
    if (windowWidth >= 640) return 2 // Medium screens - 2 columns
    return 1 // Small screens - 1 column
  }

  const columns = getGridColumns()

  // Function to create a responsive grid layout
  const createResponsiveGrid = (cards: typeof allCardData, isLastPage: boolean) => {
    // Determine how many cards to show per grid
    const maxCardsPerGrid = columns === 3 ? 6 : columns === 2 ? 4 : 2

    // Calculate number of grids needed
    const numberOfGrids = Math.ceil(cards.length / maxCardsPerGrid)

    // Create a deep copy of cards to avoid modifying the original
    let availableCards = [...cards]

    // Shuffle the cards
    availableCards = availableCards.sort(() => Math.random() - 0.5)

    // Store our assignments
    const assignments: Record<string, GridLayoutItem[]> = {}

    // For each grid, create a layout
    for (let gridIndex = 0; gridIndex < numberOfGrids; gridIndex++) {
      // Determine how many cards we need for this grid
      const cardsNeeded = maxCardsPerGrid

      // Get cards for this grid
      let gridCards = availableCards.slice(0, cardsNeeded)
      availableCards = availableCards.slice(cardsNeeded)

      // If we don't have enough cards for this grid and it's not the last page or last grid
      // recycle cards from the beginning
      if (gridCards.length < cardsNeeded && (!isLastPage || gridIndex < numberOfGrids - 1)) {
        // We need to fill all spaces except on the last grid of the last page
        const recycledCards = cards.slice(0, cardsNeeded - gridCards.length)
        gridCards = [...gridCards, ...recycledCards]
      }

      // Determine if we should have a featured card
      let featuredIndex = -1
      if (gridCards.length > 1 && columns > 1) {
        // Only create featured cards if we have multiple columns and enough cards
        featuredIndex = Math.floor(Math.random() * Math.min(gridCards.length, 2)) // Only use first 2 positions for featured
      }

      // Create a grid layout
      const gridLayout: { id: number; featured: boolean; position: number }[] = []

      // Assign cards to positions
      for (let i = 0; i < gridCards.length; i++) {
        const isFeatured = i === featuredIndex
        gridLayout.push({
          id: gridCards[i].id,
          featured: isFeatured,
          position: i,
        })
      }

      // Store this grid's layout
      assignments[`grid_${gridIndex}`] = gridLayout
    }

    return { assignments, numberOfGrids }
  }

  // Function to shuffle and assign cards
  const shuffleAndAssignCards = (page: number, size: number) => {
    setIsLoading(true)

    // Simulate network delay for fetching new cards
    setTimeout(() => {
      // Get cards for the current page
      const currentPageCards = getCurrentPageCards(page, size)

      // Check if this is the last page
      const isLastPage = page === totalPages

      // Create responsive grid layout
      const { assignments } = createResponsiveGrid(currentPageCards, isLastPage)

      setCardAssignments(assignments)
      setIsLoading(false)
    }, 500) // 500ms delay to simulate loading
  }

  // Initialize on component mount
  useEffect(() => {
    shuffleAndAssignCards(currentPage, pageSize)
  }, [])

  // Re-shuffle when window width changes (columns change)
  useEffect(() => {
    shuffleAndAssignCards(currentPage, pageSize)
  }, [columns])

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
    shuffleAndAssignCards(page, pageSize)

    // Scroll to top of grid
    document.querySelector(".card-grid-container")?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    if (newSize === pageSize) return

    // Calculate the first item index of the current page
    const currentFirstItemIndex = (currentPage - 1) * pageSize

    // Calculate what page this item would be on with the new page size
    const newPage = Math.floor(currentFirstItemIndex / newSize) + 1

    setPageSize(newSize)
    setCurrentPage(newPage)
    shuffleAndAssignCards(newPage, newSize)
  }

  // Find a card by its ID
  const getCardById = (id: number) => {
    return allCardData.find((card) => card.id === id)
  }

  // Check if we have assignments
  if (Object.keys(cardAssignments).length === 0) {
    return <div className="loading-message">Loading cards...</div>
  }

  return (
    <div className="card-grid-container">
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      ) : null}

      {/* Page size selector */}
      <div className="page-size-selector">
        <span className="page-size-label">Cards per page:</span>
        <div className="page-size-options">
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              className={`page-size-option ${size === pageSize ? "active" : ""}`}
              onClick={() => handlePageSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Render grid layouts */}
      {Object.keys(cardAssignments).map((gridKey) => {
        const gridLayout = cardAssignments[gridKey]

        if (!gridLayout || gridLayout.length === 0) return null

        return (
          <div
            key={gridKey}
            className={`card-grid ${isLoading ? "loading" : ""}`}
            style={{
              marginBottom: "2rem",
            }}
          >
            {gridLayout.map((item: { id: number; featured: boolean; position: number }) => {
              const card = getCardById(item.id)
              if (!card) return null

              return (
                <div
                  key={`${gridKey}_${item.position}`}
                  className={`card-wrapper ${item.featured ? "featured-card-wrapper" : ""}`}
                >
                  <CardItem title={card.title} date={card.date} image={card.image} featured={item.featured} />
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Pagination Controls */}
      <div className="pagination-container">
        <button className="pagination-button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="pagination-icon" />
          Previous
        </button>

        <div className="pagination-info">
          Page {currentPage} of {totalPages}
        </div>

        <button
          className="pagination-button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="pagination-icon" />
        </button>
      </div>

      {/* Page number buttons */}
      <div className="pagination-numbers">
        {totalPages <= 10
          ? Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-number ${page === currentPage ? "active" : ""}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))
          : // For many pages, show a limited set with ellipsis
          (() => {
            const pageNumbers = []
            const maxVisiblePages = 5
            const halfVisible = Math.floor(maxVisiblePages / 2)

            // Always show first page
            pageNumbers.push(1)

            // Calculate range around current page
            let rangeStart = Math.max(2, currentPage - halfVisible)
            let rangeEnd = Math.min(totalPages - 1, currentPage + halfVisible)

            // Adjust range to show maxVisiblePages
            if (rangeEnd - rangeStart + 1 < maxVisiblePages) {
              if (currentPage < totalPages / 2) {
                // Near beginning, extend end
                rangeEnd = Math.min(totalPages - 1, rangeStart + maxVisiblePages - 1)
              } else {
                // Near end, extend start
                rangeStart = Math.max(2, rangeEnd - maxVisiblePages + 1)
              }
            }

            // Add ellipsis after first page if needed
            if (rangeStart > 2) {
              pageNumbers.push("ellipsis1")
            }

            // Add range pages
            for (let i = rangeStart; i <= rangeEnd; i++) {
              pageNumbers.push(i)
            }

            // Add ellipsis before last page if needed
            if (rangeEnd < totalPages - 1) {
              pageNumbers.push("ellipsis2")
            }

            // Always show last page
            if (totalPages > 1) {
              pageNumbers.push(totalPages)
            }

            return pageNumbers.map((page) => {
              if (page === "ellipsis1" || page === "ellipsis2") {
                return (
                  <span key={`${page}`} className="page-ellipsis">
                    ...
                  </span>
                )
              }

              return (
                <button
                  key={`page-${page}`}
                  className={`page-number ${page === currentPage ? "active" : ""}`}
                  onClick={() => goToPage(page as number)}
                >
                  {page}
                </button>
              )
            })
          })()}
      </div>
    </div>
  )
}

interface CardItemProps {
  title: string
  date: string
  image: string
  featured?: boolean
}

function CardItem({ title, date, image, featured = false }: CardItemProps) {
  return (
    <div className={`card ${featured ? "featured-card" : ""}`}>
      <div className="card-image-container" style={{ height: featured ? "300px" : "200px" }}>
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="card-image"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="card-content">
        <h3 className={`card-title ${featured ? "featured-title" : ""}`}>{title}</h3>
        {featured && (
          <p className="card-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        )}
        <div className="card-footer">
          <CalendarIcon className="calendar-icon" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}
