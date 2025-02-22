const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();

// Cache shoe details for 24 hours
export const revalidate = 86400;

export async function GET(request, { params }) {
  try {
    // Ensure params is properly resolved
    const { id } = await Promise.resolve(params);
    
    return new Promise((resolve, reject) => {
      sneaks.getProductPrices(id, (err, product) => {
        if (err || !product) {
          resolve(new Response(JSON.stringify({ error: 'Failed to fetch shoe details' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }));
          return;
        }

        // Transform the data to include all necessary information
        const shoeData = {
          styleID: product.styleID,
          name: product.shoeName,
          brand: product.brand,
          description: product.description,
          colorway: product.colorway,
          thumbnail: product.thumbnail,
          imageLinks: product.imageLinks,
          releaseDate: product.releaseDate,
          retailPrice: product.retailPrice,
          resellPrices: {
            stockX: product.lowestResellPrice?.stockX || null,
            goat: product.lowestResellPrice?.goat || null,
            flightClub: product.lowestResellPrice?.flightClub || null
          },
          resellLinks: {
            stockX: product.resellLinks?.stockX || null,
            goat: product.resellLinks?.goat || null,
            flightClub: product.resellLinks?.flightClub || null
          }
        };

        // Create response with cache headers
        const response = new Response(JSON.stringify(shoeData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=86400'
          },
        });

        resolve(response);
      });
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
