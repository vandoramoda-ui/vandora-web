import { logger } from './logger';

/**
 * Syncs a product to the Klaviyo Catalog.
 * It first tries to create the item. If it already exists (409), it updates it.
 */
export const syncProductToKlaviyo = async (product: any, privateKey: string) => {
  if (!privateKey) {
    console.warn('Klaviyo sync skipped: Missing private API key');
    return { success: false, error: 'Missing API Key' };
  }

  const siteUrl = 'https://www.vandora.boutique';
  const productUrl = `${siteUrl}/producto/${product.slug || product.id}`;
  
  // Format image URLs
  const imageUrls = Array.isArray(product.images) 
    ? product.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
    : [];
  
  const mainImage = imageUrls.length > 0 ? imageUrls[0] : '';

  const attributes = {
    integration_type: '$custom',
    catalog_type: '$default',
    published: true,
    title: product.name,
    external_id: product.id,
    price: parseFloat(product.price) || 0,
    description: product.description || '',
    url: productUrl,
    image_full_url: mainImage,
    image_thumbnail_url: mainImage,
    images: imageUrls,
    custom_metadata: {
      category: product.category || 'General',
      sku: product.sku || product.id
    }
  };

  const relationships = {
    categories: {
      data: [
        {
          type: 'catalog-category',
          id: `$custom:::$default:::${product.category || 'General'}`
        }
      ]
    }
  };

  try {
    // 1. Try to CREATE
    const createResponse = await fetch('https://a.klaviyo.com/api/catalog-items', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${privateKey}`,
        'accept': 'application/vnd.api+json',
        'content-type': 'application/vnd.api+json',
        'revision': '2026-01-15'
      },
      body: JSON.stringify({
        data: {
          type: 'catalog-item',
          attributes,
          relationships
        }
      })
    });

    if (createResponse.ok) {
      logger.info('Producto creado en Klaviyo', { source: 'klaviyo_sync', metadata: { product_id: product.id } });
      return { success: true, action: 'created' };
    }

    // 2. If exists (409), try to UPDATE (PATCH)
    if (createResponse.status === 409) {
      const updateResponse = await fetch(`https://a.klaviyo.com/api/catalog-items/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Klaviyo-API-Key ${privateKey}`,
          'accept': 'application/vnd.api+json',
          'content-type': 'application/vnd.api+json',
          'revision': '2026-01-15'
        },
        body: JSON.stringify({
          data: {
            type: 'catalog-item',
            id: product.id,
            attributes
          }
        })
      });

      if (updateResponse.ok) {
        logger.info('Producto actualizado en Klaviyo', { source: 'klaviyo_sync', metadata: { product_id: product.id } });
        return { success: true, action: 'updated' };
      }

      const updateError = await updateResponse.json();
      throw new Error(`Klaviyo update failed: ${updateResponse.status} ${JSON.stringify(updateError)}`);
    }

    const createError = await createResponse.json();
    throw new Error(`Klaviyo creation failed: ${createResponse.status} ${JSON.stringify(createError)}`);

  } catch (err: any) {
    logger.error('Error sincronizando con Klaviyo', err, { 
      source: 'klaviyo_sync', 
      metadata: { product_id: product.id } 
    });
    return { success: false, error: err.message };
  }
};
