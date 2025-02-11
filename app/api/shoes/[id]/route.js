const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();

export async function GET(request, { params }) {
  try {
    const styleId = params.id;
    
    return new Promise((resolve, reject) => {
      sneaks.getProductPrices(styleId, (err, product) => {
        if (err) {
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

        resolve(new Response(JSON.stringify(shoeData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }));
      });
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
