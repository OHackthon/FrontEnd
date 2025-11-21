import API from '@/services/axiosInterceptor.js'

export default class CategoriaAcervoApi {
    async fetchCategorias() {
        const { data } =  await API.get('categorias-acervo/')
        return data
    }
    async createCategoria(categoria) {
        const { data } = await API.post('categorias-acervo/', categoria)
        return data
    }
    async updateCategoria(categoria) {
        const { data } = await API.put(`categorias-acervo/${acervo.id}/`, categoria)
        return data
    }
    async deleteCategoria(id) {
        await API.delete(`categorias-acervo/${id}/`)
    }
}