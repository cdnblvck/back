import slugify from 'slugify';

function generateSlug(text: string): string {
  return slugify(text, {
    lower: true, // Convert the slug to lowercase
    remove: /[*+~.()'"!:@]/g, // Remove special characters
  });
}

export default generateSlug;
